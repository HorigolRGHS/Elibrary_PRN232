# Request: Expose Admin category endpoints and enable PUT/DELETE

Summary
-------
The frontend cannot perform per-item GET/PUT/DELETE operations against the categories API. Collection GET (list) and POST (create) work, but all attempts to read/update/delete a single category using per-item URL shapes return 404, and attempts to use query-based collection URLs for delete/update return 405 Method Not Allowed with an Allow header of `GET, POST`.

This prevents the FE from implementing full CRUD (edit/delete) in the browser. The backend should expose admin-specific per-item endpoints (or make per-item methods available) and protect them with an Authorize attribute for Admin users.

Observed behaviour (from local diagnostics)
-----------------------------------------
- GET /catalog/api/categories -> 200 OK (array)
- GET /catalog/api/categories(1) -> 404 Not Found
- GET /catalog/api/categories/1 -> 404 Not Found
- GET /catalog/api/categories?CategoryId=1 -> 200 OK (returns array with item)
- PUT /catalog/api/categories?CategoryId=1 -> 405 Method Not Allowed
  - Response header: `Allow: GET, POST`
  - Body: empty
- DELETE /catalog/api/categories?CategoryId=1 -> 405 Method Not Allowed
  - Response header: `Allow: GET, POST`

Notes:
- Re-running the probes with an Admin JWT did not change the above results (i.e. 404/405 persisted when Authorization was provided).
- OPTIONS preflight for many per-item variants returned 404 in our runs.

Why this is a problem
---------------------
- Frontend needs a stable per-item route to call PUT/DELETE (or an admin-specific route) to update or delete a category.
- Current gateway/router mapping does not expose those methods to the browser, causing 404/405 and preventing admin UX.

Suggested server-side fixes (recommended)
-----------------------------------------
1. Expose admin per-item endpoints and protect them with `[Authorize(Roles = "Admin")]`.
   - Example routes:
     - GET /catalog/api/categories/admin/{id}
     - PUT /catalog/api/categories/admin/{id}
     - DELETE /catalog/api/categories/admin/{id}
   - Example C# controller snippet:

```csharp
[ApiController]
[Route("catalog/api/[controller]")]
public class CategoriesController : ControllerBase
{
    [HttpGet("admin/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult GetAdmin(int id) { ... }

    [HttpPut("admin/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult UpdateAdmin(int id, [FromBody] CategoryUpdateModel model) { ... }

    [HttpDelete("admin/{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult DeleteAdmin(int id) { ... }
}
```

2. Alternatively, enable per-item methods on the existing route shapes (if the API should support OData-style /catalog/api/categories({key}) or /catalog/api/categories/{id}). Ensure the gateway/router maps those and returns correct Allow headers for OPTIONS.

3. Ensure the server responds to OPTIONS for CORS preflight on admin routes and advertises allowed methods (`Allow: GET, PUT, DELETE, OPTIONS`) as appropriate.

Suggested frontend changes (once server exposes admin endpoints)
----------------------------------------------------------------
- Add admin-specific methods in `services/category/Category.ts`:
  - `getAdminList`, `getAdminItem`, `updateAdmin`, `deleteAdmin` that call `/catalog/odata/categories` and `/catalog/api/categories/admin/{id}` respectively (match `DocumentService` patterns).
- Use existing client-side Admin check (JWT role claim) to show/hide admin controls.

Suggested acceptance criteria
----------------------------
- Admin users can successfully call GET/PUT/DELETE on the documented admin per-item endpoints and receive 200/204 as appropriate.
- OPTIONS responses for admin endpoints include allowed methods and satisfy CORS preflight.
- Frontend integration test: use an Admin JWT to call the new admin delete API and observe a successful deletion (or proper 204/200 + body).

Troubleshooting data to attach to ticket
---------------------------------------
Please attach the following from a failing run (already available from local diagnostics):
- Example full request/response (method, URL, headers) for a failing PUT or DELETE.
- Response headers and body (405 with Allow header) as captured by the FE or the diagnostic script.

Next steps for backend team
--------------------------
1. Confirm intended API shape for admin operations on categories and document the exact URLs and allowed methods.
2. If admin per-item endpoints should exist, implement them and secure with `[Authorize(Roles = "Admin")]`.
3. If using gateway routing rules, ensure routes for per-item actions are not blocked and that OPTIONS responses are configured for CORS preflight.
4. Notify frontend when the endpoints are ready; frontend can then call `CategoryService` admin methods or the FE team can provide a small PR if desired.

Contact
-------
If you need the raw logs/diagnostics from the probing script, I can re-run the diagnostics or paste the logs (sanitized) into this ticket. The frontend engineer who ran these tests is available to collaborate on verification.
