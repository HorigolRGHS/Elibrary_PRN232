# Category Endpoints - Missing Backend Implementation

## Status
❌ **UPDATE and DELETE endpoints for categories are NOT implemented in the backend gateway.**

## Issue
Frontend category detail/edit page cannot update or delete individual categories because the backend does not expose per-item endpoints.

## Current Behavior

### Working Endpoints ✅
- **GET** `/catalog/api/categories` → Returns list of all categories (200 OK)
- **GET** `/catalog/api/categories?CategoryId={id}` → Returns array with matching item (200 OK)
- **POST** `/catalog/api/categories` → Create new category (200 OK)

### Broken Endpoints ❌
All of these return **404 Not Found**:

**Per-item GET (Detail):**
- `GET /catalog/api/categories/{id}` → 404
- `GET /catalog/api/categories({id})` → 404
- `GET /catalog/api/categories(CategoryId={id})` → 404
- `GET /catalog/api/categories('{id}')` → 404

**Per-item UPDATE:**
- `PATCH /catalog/api/categories/{id}` → 404
- `PUT /catalog/api/categories/{id}` → 404
- `PATCH /catalog/api/categories({id})` → 404
- `PUT /catalog/api/categories({id})` → 404
- `PATCH /catalog/api/categories/admin/{id}` → 404
- `PATCH /catalog/api/categories/admin/({id})` → 404

**Per-item DELETE:**
- `DELETE /catalog/api/categories/{id}` → 404
- `DELETE /catalog/api/categories({id})` → 404

## Frontend Workaround for GET Detail
Frontend uses fallback strategy for reading details:
1. Try per-item GET endpoints (all 404)
2. Fall back to query-style GET `/catalog/api/categories?CategoryId={id}` (200 with array)
3. Search array for matching ID and extract item
4. **Detail view now works** ✅ (but via workaround)

## What Backend Needs to Implement

### Minimum Required Endpoints

```csharp
// DTO for response
public class CategoryUpdateRequest
{
    public string CategoryName { get; set; }
    public string Description { get; set; }
}

public class CategoryResponse
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; }
    public string Description { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }
}

// Controller - Public endpoints
[HttpGet("/catalog/api/categories/{id}")]
public async Task<IActionResult> GetCategoryById(int id)
{
    var category = await _categoryService.GetByIdAsync(id);
    if (category == null) return NotFound();
    return Ok(category);
}

[HttpPatch("/catalog/api/categories/{id}")]
public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryUpdateRequest request)
{
    var updated = await _categoryService.UpdateAsync(id, request);
    if (updated == null) return NotFound();
    return Ok(updated);
}

[HttpDelete("/catalog/api/categories/{id}")]
public async Task<IActionResult> DeleteCategory(int id)
{
    var success = await _categoryService.DeleteAsync(id);
    if (!success) return NotFound();
    return NoContent();
}

// Admin-protected endpoints (optional, for role-based access)
[Authorize(Roles = "Admin")]
[HttpPatch("/catalog/api/categories/admin/{id}")]
public async Task<IActionResult> UpdateCategoryAdmin(int id, [FromBody] CategoryUpdateRequest request)
{
    var updated = await _categoryService.UpdateAsync(id, request);
    if (updated == null) return NotFound();
    return Ok(updated);
}

[Authorize(Roles = "Admin")]
[HttpDelete("/catalog/api/categories/admin/{id}")]
public async Task<IActionResult> DeleteCategoryAdmin(int id)
{
    var success = await _categoryService.DeleteAsync(id);
    if (!success) return NotFound();
    return NoContent();
}
```

### Expected Request/Response Examples

**Update Category (200 OK):**
```
PATCH /catalog/api/categories/11
Content-Type: application/json

{
  "CategoryName": "Updated Name",
  "Description": "Updated Description"
}

Response (200 OK):
{
  "categoryId": 11,
  "categoryName": "Updated Name",
  "description": "Updated Description",
  "createdDate": "2025-11-04T00:00:00Z",
  "updatedDate": "2025-11-04T04:30:00Z"
}
```

**Delete Category (204 No Content):**
```
DELETE /catalog/api/categories/11

Response (204 No Content)
```

## Frontend Impact

### Current State (Category Detail Page)
- ✅ **Read (View Detail):** Works via fallback query-style GET
- ❌ **Update (Edit):** Disabled (shows message to user)
- ❌ **Delete:** Will fail if attempted

### After Backend Implementation
- ✅ Read: Continue to work
- ✅ Update: Enable full CRUD for categories
- ✅ Delete: Enable soft/hard delete with confirmation

## Notes
- Documents follow same pattern: `PATCH /catalog/api/documents/{id}` works correctly
- Categories should follow identical pattern for consistency
- Admin authorization should be enforced via `[Authorize(Roles = "Admin")]` if per-admin endpoints needed
- Frontend will automatically detect and use admin endpoints when user has Admin role in JWT

## Test Cases for Backend Team

```bash
# Test 1: Get detail
curl -H "Authorization: Bearer {token}" \
  https://localhost:7000/catalog/api/categories/11

# Test 2: Update
curl -X PATCH -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"CategoryName":"Test","Description":"Desc"}' \
  https://localhost:7000/catalog/api/categories/11

# Test 3: Delete
curl -X DELETE -H "Authorization: Bearer {admin_token}" \
  https://localhost:7000/catalog/api/categories/11
```

---
**Created:** 2025-11-04  
**Component:** Frontend Category CRUD  
**Status:** Blocked by backend - waiting for endpoint implementation
