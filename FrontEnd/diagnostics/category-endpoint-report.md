# Category endpoints diagnostics

Date: 2025-11-03

Summary
-------
When attempting to delete or update a category from the frontend, the gateway/service responds with 405 (Method Not Allowed) or 404 for per-item routes. The frontend currently probes the API and disables destructive actions when the backend does not advertise support for PUT/DELETE.

Key findings (from local run)
 - GET /catalog/api/categories → 200 OK (returns array of categories)
 - Per-item patterns return 404:
   - GET /catalog/api/categories(1) → 404
   - GET /catalog/api/categories/1 → 404
 - Attempts to PUT/DELETE using collection query parameters return 405 and Allow: GET, POST:
   - DELETE /catalog/api/categories?CategoryId=4 → 405 Method Not Allowed
     - response headers observed: { "content-length": "0" }
 - OPTIONS requests for the collection/item routes return 404 (no preflight handler)

Observed client-side error (example JSON captured by frontend when user pressed Delete):

```json
{
  "message": "Request failed with status code 405",
  "status": 405,
  "attempted": "/catalog/api/categories?CategoryId=4",
  "responseHeaders": {
    "content-length": "0"
  },
  "responseData": ""
}
```

Why this matters
-----------------
- The client (browser) expects per-item routes for categories so it can perform PUT/DELETE on a specific resource (e.g. `/catalog/api/categories/{id}` or OData-style `/catalog/api/categories({key})`).
- When those routes are missing or when the server does not respond to OPTIONS preflight with `Access-Control-Allow-Methods` that include PUT/DELETE, the browser will either prevent requests or the API will return 405 — either way destructive operations can't proceed.

Requested action for backend / gateway team
-----------------------------------------
Please ensure one of the following is implemented and exposed through the gateway under the `/catalog` prefix:

1) Per-item REST endpoints

   - Implement and expose these endpoints (Admin-protected as appropriate):
     - GET /catalog/api/categories/{id}
     - PUT /catalog/api/categories/{id}
     - DELETE /catalog/api/categories/{id}

   - Or expose the documented OData-style keys (if using OData):
     - GET /catalog/api/categories({key})
     - PUT /catalog/api/categories({key})
     - DELETE /catalog/api/categories({key})

2) Make sure CORS and OPTIONS preflight handling is correct

   - OPTIONS on collection and item routes should return 200/204 with headers including (as applicable):
     - Access-Control-Allow-Origin: http://localhost:3000 (or the production origin)
     - Access-Control-Allow-Credentials: true
     - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
     - Access-Control-Allow-Headers: Authorization, Content-Type, ...

3) If PUT/DELETE are intentionally disabled on the public collection URL, provide an admin route mapping

   - If the intended behavior is to use a different admin path (for example `/catalog/api/categories/admin/{id}` or `/catalog/api/admin/categories/{id}`), please document the exact URL and allowed methods so the frontend can call the correct endpoint.

Minimal .NET example (controller) to add per-item routes
-------------------------------------------------------
If the backend is ASP.NET Core (Kestrel was observed), controller methods look like:

```csharp
[ApiController]
[Route("catalog/api/categories")]
public class CategoriesController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll() { ... }

    [HttpGet("{id}")]
    public IActionResult Get(int id) { ... }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult Update(int id, [FromBody] UpdateCategoryDto dto) { ... }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult Delete(int id) { ... }
}
```

Also ensure `UseCors` is configured to allow the originating frontend (or respond to OPTIONS on these routes).

How to reproduce (quick)
-----------------------
From the development machine (example):

1. Check collection:

```bash
curl -v "https://localhost:7000/catalog/api/categories"
```

2. Probe per-item path:

```bash
curl -v "https://localhost:7000/catalog/api/categories/1"
```

3. Check DELETE behavior (with Authorization header if required):

```bash
curl -v -X DELETE "https://localhost:7000/catalog/api/categories?CategoryId=4" -H "Authorization: Bearer <token>"
```

4. Check OPTIONS preflight for the collection (what frontend probe sends):

```bash
curl -v -X OPTIONS "https://localhost:7000/catalog/api/categories" -H "Origin: http://localhost:3000"
```

What we observed (from local diagnostic run)
-----------------------------------------
- GET /catalog/api/categories → 200 OK (list returned)
- DELETE /catalog/api/categories?CategoryId=4 → 405 Method Not Allowed (response empty; headers contain only content-length)
- OPTIONS /catalog/api/categories → 404 Not Found

Suggested acceptance criteria (what to verify once fixed)
--------------------------------------------------------
 - OPTIONS /catalog/api/categories returns 200/204 and `Access-Control-Allow-Methods` includes PUT and DELETE (when appropriate).
 - DELETE /catalog/api/categories/{id} returns 204 or 200 on success and 401/403 on permission issues.
 - GET /catalog/api/categories/{id} returns a single category JSON object (200) or 404 if missing.

If you want, I can also provide a small client-side PR to call whichever admin endpoint you expose (or to use a server-side proxy if you prefer not to expose DELETE directly to the browser).

-- End of report
