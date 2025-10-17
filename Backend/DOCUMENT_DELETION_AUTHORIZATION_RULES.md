# Document Deletion Authorization Rules

## Overview
Implemented role-based authorization for document deletion with the following rules:
- **Admin:** Can delete any document
- **Customer:** Can only delete their own documents (those they created)

---

## Deletion Rules

### Rule 1: Admin Full Permission
```
If user role == "Admin"
  → Can delete ANY document
  → No ownership check required
```

### Rule 2: Customer Restricted Permission
```
If user role == "Customer"
  → Can ONLY delete documents where CreatedBy == userId
  → If not creator → Forbidden (403)
```

### Rule 3: Already Deleted Documents
```
If document.DeletedBy != null (already deleted)
  → Return 404 Not Found
```

---

## Implementation Details

### Controller Changes (DocumentsController.cs)

#### Before:
```csharp
[Authorize(Roles = "Admin,Customer")]
[HttpDelete("{id:int}")]
public async Task<IActionResult> Delete(int id)
{
    var resp = await _service.DeleteAsync(id);
    return resp.Success ? Ok(resp) : NotFound(resp);
}
```

#### After:
```csharp
[Authorize(Roles = "Admin,Customer")]
[HttpDelete("{id:int}")]
public async Task<IActionResult> Delete(int id)
{
    // Get user ID and role from bearer token claims
    var userId = User.GetUserIdOrThrow();
    var userRole = User.FindFirstValue(System.Security.Claims.ClaimTypes.Role);
    
    var resp = await _service.DeleteAsync(id, userId, userRole);
    return resp.Success ? Ok(resp) : (resp.Message.Contains("not found") ? NotFound(resp) : Forbid());
}
```

**Changes:**
- ✅ Extract `userId` from token claims (`sub`)
- ✅ Extract `userRole` from token claims
- ✅ Pass both to service method
- ✅ Return appropriate HTTP status codes

---

### Service Changes (DocumentService.cs)

#### Before:
```csharp
public async Task<ApiResponse<bool>> DeleteAsync(int id)
{
    var existing = await _repository.GetByIdAsync(id);
    if (existing == null || existing.DeletedBy.HasValue)
        return ApiResponse<bool>.Fail("Document not found");

    existing.DeletedBy = existing.CreatedBy;  // ❌ Wrong - should be current user
    existing.DeletedDate = DateTime.UtcNow;

    await _repository.UpdateAsync(existing);
    await _repository.SaveChangesAsync();

    return ApiResponse<bool>.Ok(true);
}
```

#### After:
```csharp
public async Task<ApiResponse<bool>> DeleteAsync(int id, int userId, string? userRole)
{
    var existing = await _repository.GetByIdAsync(id);
    if (existing == null || existing.DeletedBy.HasValue)
        return ApiResponse<bool>.Fail("Document not found");

    // Check permissions: Admin has full permission, Customer can only delete own documents
    if (!string.Equals(userRole, "Admin", StringComparison.OrdinalIgnoreCase))
    {
        // Customer can only delete their own documents
        if (existing.CreatedBy != userId)
            return ApiResponse<bool>.Fail(
                "You do not have permission to delete this document. " +
                "Only the creator or admin can delete it.");
    }

    existing.DeletedBy = userId;  // ✅ Set to current user
    existing.DeletedDate = DateTime.UtcNow;

    await _repository.UpdateAsync(existing);
    await _repository.SaveChangesAsync();

    return ApiResponse<bool>.Ok(true, "Document deleted successfully");
}
```

**Changes:**
- ✅ Accept `userId` and `userRole` parameters
- ✅ Permission check: Admin vs Customer
- ✅ Customer ownership validation
- ✅ Set `DeletedBy` to current user (not creator)
- ✅ Added success message

---

## API Endpoint

### Delete Document
**Endpoint:** `DELETE /api/documents/{id}`

**Authorization:** Required (Bearer token with Admin or Customer role)

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | int | Yes | Document ID to delete |

**Request:**
```bash
curl -X DELETE https://api.example.com/api/documents/123 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Response Scenarios

### ✅ Scenario 1: Admin Deletes Any Document
**User:** Admin (role: "Admin")
**Action:** Delete document ID 5
**Result:** ✅ Success

**Request:**
```bash
curl -X DELETE https://api.example.com/api/documents/5 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": true,
  "message": "Document deleted successfully"
}
```

---

### ✅ Scenario 2: Customer Deletes Own Document
**User:** Customer (userId: 2, role: "Customer")
**Document:** Created by userId 2
**Action:** Delete document ID 10
**Result:** ✅ Success

**Request:**
```bash
curl -X DELETE https://api.example.com/api/documents/10 \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": true,
  "message": "Document deleted successfully"
}
```

---

### ❌ Scenario 3: Customer Tries to Delete Someone Else's Document
**User:** Customer (userId: 2, role: "Customer")
**Document:** Created by userId 3
**Action:** Try to delete document ID 10
**Result:** ❌ Permission Denied

**Request:**
```bash
curl -X DELETE https://api.example.com/api/documents/10 \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

**Response (403 Forbidden):**
```
(HTTP 403 Forbid response)
```

**Response Body (if not caught by Forbid()):**
```json
{
  "success": false,
  "data": null,
  "message": "You do not have permission to delete this document. Only the creator or admin can delete it."
}
```

---

### ❌ Scenario 4: Document Not Found
**Action:** Try to delete non-existent document
**Result:** ❌ Not Found

**Request:**
```bash
curl -X DELETE https://api.example.com/api/documents/999 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "data": null,
  "message": "Document not found"
}
```

---

### ❌ Scenario 5: Already Deleted Document
**Action:** Try to delete a document that's already deleted
**Result:** ❌ Not Found

**Request:**
```bash
curl -X DELETE https://api.example.com/api/documents/5 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "data": null,
  "message": "Document not found"
}
```

---

### ⚠️ Scenario 6: Missing Authorization
**Action:** Delete without token
**Result:** ❌ Unauthorized

**Request:**
```bash
curl -X DELETE https://api.example.com/api/documents/5
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "data": null,
  "message": "Unauthorized"
}
```

---

## Token Claims Used

From bearer token JWT:
```json
{
  "sub": "2",  // ← userId used for ownership check
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Customer",  // ← role used for permission check
  "exp": 1763275256,
  "iss": "ELibrary",
  "aud": "ELibraryClients"
}
```

---

## HTTP Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Document deleted successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Customer tried to delete another's document |
| 404 | Not Found | Document not found or already deleted |
| 500 | Server Error | Server error occurred |

---

## Error Messages

| Message | Reason | HTTP Code |
|---------|--------|-----------|
| "Document not found" | Document doesn't exist or already deleted | 404 |
| "You do not have permission to delete this document. Only the creator or admin can delete it." | Customer tried to delete another's document | 403 |
| Other error | Unexpected error | 500 |

---

## Permission Matrix

| Role | Own Document | Others' Documents |
|------|--------------|-------------------|
| Admin | ✅ Can delete | ✅ Can delete |
| Customer | ✅ Can delete | ❌ Cannot delete |
| Guest | ❌ Forbidden | ❌ Forbidden |

---

## Files Modified

1. **DocumentsController.cs**
   - Added `using System.Security.Claims;`
   - Updated Delete method to extract userId and userRole
   - Return appropriate status codes (Forbid for permission denied)

2. **DocumentService.cs**
   - Updated DeleteAsync signature: `DeleteAsync(int id, int userId, string? userRole)`
   - Added permission validation logic
   - Fixed DeletedBy to use current user instead of creator
   - Added success message

3. **IDocumentService.cs**
   - Updated DeleteAsync interface signature

---

## Code Flow Diagram

```
DELETE /api/documents/{id}
    ↓
[Authorize] - Check token exists
    ↓
Extract userId from "sub" claim
    ↓
Extract userRole from role claim
    ↓
Call DeleteAsync(id, userId, userRole)
    ↓
Get document from database
    ↓
Check if document exists?
  ├─ No → Return 404 "Document not found"
  └─ Yes ↓
    Check if userRole == "Admin"?
    ├─ Yes → Allow deletion ✅
    └─ No ↓
      Check if userId == document.CreatedBy?
      ├─ Yes → Allow deletion ✅
      └─ No → Return Forbid (403) ❌
        ↓
    Mark as deleted (DeletedBy = userId)
        ↓
    Save to database
        ↓
    Return 200 OK with success message
```

---

## Testing Guide

### Test Case 1: Admin Deletes Document
```csharp
[Fact]
public async Task Delete_AdminCanDeleteAnyDocument_ReturnsSuccess()
{
    // Arrange
    var adminToken = GenerateToken(userId: 1, role: "Admin");
    var documentId = 5; // Created by userId 2
    
    // Act
    var response = await client.DeleteAsync($"/api/documents/{documentId}", adminToken);
    
    // Assert
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
}
```

### Test Case 2: Customer Deletes Own Document
```csharp
[Fact]
public async Task Delete_CustomerDeletesOwnDocument_ReturnsSuccess()
{
    // Arrange
    var customerToken = GenerateToken(userId: 2, role: "Customer");
    var documentId = 10; // Created by userId 2
    
    // Act
    var response = await client.DeleteAsync($"/api/documents/{documentId}", customerToken);
    
    // Assert
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
}
```

### Test Case 3: Customer Cannot Delete Others' Document
```csharp
[Fact]
public async Task Delete_CustomerTriesToDeleteOthersDocument_ReturnsForbidden()
{
    // Arrange
    var customerToken = GenerateToken(userId: 2, role: "Customer");
    var documentId = 10; // Created by userId 3
    
    // Act
    var response = await client.DeleteAsync($"/api/documents/{documentId}", customerToken);
    
    // Assert
    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
}
```

---

## Security Considerations

✅ **Token-based:** User role and ID come from JWT token, cannot be spoofed
✅ **Role-based:** Clear role hierarchy (Admin > Customer)
✅ **Ownership validation:** Customers verified as document creator
✅ **Audit trail:** DeletedBy field tracks who deleted the document
✅ **Soft delete:** Documents marked as deleted, not removed from database

---

## Backward Compatibility

⚠️ **Breaking Changes:**
- Old clients calling DeleteAsync with only `id` parameter will fail
- API response now includes message

✅ **Migration:** Update all delete calls to pass userId and userRole

---

## Summary

| Aspect | Details |
|--------|---------|
| Admin Permission | Full access to delete any document |
| Customer Permission | Can only delete documents they created |
| Authorization | Bearer token required (Admin or Customer role) |
| Response | 200 OK on success, 403 Forbidden on permission denied, 404 Not Found |
| Audit | DeletedBy field records who performed the deletion |

**Status:** ✅ Ready for production
