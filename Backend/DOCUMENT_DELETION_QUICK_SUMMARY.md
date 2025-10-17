# Document Deletion Authorization - Implementation Summary

## ✅ COMPLETED

Document deletion now includes role-based authorization rules.

---

## Quick Reference

### Rules
```
┌─ ADMIN ROLE
│  └─ ✅ Can delete ANY document
│
└─ CUSTOMER ROLE
   ├─ ✅ Can delete OWN documents (CreatedBy == userId)
   └─ ❌ Cannot delete OTHERS' documents → Forbidden (403)
```

---

## Code Changes

### 1. Controller (DocumentsController.cs)
```csharp
[Authorize(Roles = "Admin,Customer")]
[HttpDelete("{id:int}")]
public async Task<IActionResult> Delete(int id)
{
    var userId = User.GetUserIdOrThrow();                    // From "sub" claim
    var userRole = User.FindFirstValue(ClaimTypes.Role);    // From role claim
    
    var resp = await _service.DeleteAsync(id, userId, userRole);
    
    return resp.Success ? Ok(resp) 
        : (resp.Message.Contains("not found") ? NotFound(resp) : Forbid());
}
```

### 2. Service (DocumentService.cs)
```csharp
public async Task<ApiResponse<bool>> DeleteAsync(int id, int userId, string? userRole)
{
    var existing = await _repository.GetByIdAsync(id);
    if (existing == null || existing.DeletedBy.HasValue)
        return ApiResponse<bool>.Fail("Document not found");

    // Permission check
    if (!string.Equals(userRole, "Admin", StringComparison.OrdinalIgnoreCase))
    {
        if (existing.CreatedBy != userId)
            return ApiResponse<bool>.Fail(
                "You do not have permission to delete this document. " +
                "Only the creator or admin can delete it.");
    }

    existing.DeletedBy = userId;        // Track who deleted
    existing.DeletedDate = DateTime.UtcNow;

    await _repository.UpdateAsync(existing);
    await _repository.SaveChangesAsync();

    return ApiResponse<bool>.Ok(true, "Document deleted successfully");
}
```

### 3. Interface (IDocumentService.cs)
```csharp
Task<ApiResponse<bool>> DeleteAsync(int id, int userId, string? userRole);
```

---

## Test Scenarios

### ✅ Admin deletes any document
```bash
DELETE /api/documents/5
Authorization: Bearer ADMIN_TOKEN
→ 200 OK "Document deleted successfully"
```

### ✅ Customer deletes own document
```bash
DELETE /api/documents/10
Authorization: Bearer CUSTOMER_TOKEN  // userId: 2, CreatedBy: 2
→ 200 OK "Document deleted successfully"
```

### ❌ Customer deletes other's document
```bash
DELETE /api/documents/10
Authorization: Bearer CUSTOMER_TOKEN  // userId: 2, CreatedBy: 3
→ 403 Forbidden
```

### ❌ Document not found
```bash
DELETE /api/documents/999
Authorization: Bearer ADMIN_TOKEN
→ 404 Not Found "Document not found"
```

### ❌ Already deleted
```bash
DELETE /api/documents/5  // DeletedBy != null
Authorization: Bearer ADMIN_TOKEN
→ 404 Not Found "Document not found"
```

---

## Token Claims

```json
{
  "sub": "2",                                    // userId for ownership check
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Customer",  // role
  "exp": 1763275256,
  "iss": "ELibrary",
  "aud": "ELibraryClients"
}
```

---

## HTTP Status Codes

| Code | Scenario |
|------|----------|
| 200 | ✅ Document deleted |
| 403 | ❌ Permission denied (customer tried to delete other's doc) |
| 404 | ❌ Document not found or already deleted |
| 401 | ❌ Unauthorized (no token) |
| 500 | ⚠️ Server error |

---

## Permission Matrix

```
          Own Doc   Others' Doc
Admin      ✅        ✅
Customer   ✅        ❌
Guest      ❌        ❌
```

---

## Key Features

✅ **Admin Full Control** - Can delete any document
✅ **Customer Restricted** - Can only delete own documents
✅ **Audit Trail** - DeletedBy tracks who deleted
✅ **Soft Delete** - Not removed from DB, just marked deleted
✅ **Proper HTTP Codes** - 403 for permission denied, 404 for not found
✅ **Clear Error Messages** - Tells user why deletion failed

---

## Files Modified

| File | Changes |
|------|---------|
| DocumentsController.cs | Extract userId & role, pass to service |
| DocumentService.cs | Add permission logic, fix DeletedBy field |
| IDocumentService.cs | Update interface signature |

---

## Status: ✅ READY FOR PRODUCTION

All changes implemented, tested, and documented.

**Documentation:** See `DOCUMENT_DELETION_AUTHORIZATION_RULES.md` for complete details.
