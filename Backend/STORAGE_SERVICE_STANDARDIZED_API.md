# Storage Service API - Standardized with ApiResponse

## Overview
The Storage Service has been refactored to use the standardized `ApiResponse<T>` pattern from SharedLibrary, ensuring consistency across all microservices.

## Standard Response Format

All endpoints now return `ApiResponse<T>` with the following structure:

```json
{
  "success": true/false,
  "data": {
    "//": "Endpoint-specific data"
  },
  "message": "Success or error message"
}
```

---

## API Endpoints

### 1. Upload Image
**Endpoint:** `POST /api/upload/image`

**Authorization:** Bearer token required (Admin or Customer role)

**Content-Type:** `multipart/form-data`

**Request:**
```bash
curl -X POST https://api.example.com/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "File=@image.jpg"
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "fileName": "https://i.ibb.co/abc123/image.jpg"
  },
  "message": "Image uploaded successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "data": null,
  "message": "File size exceeds 10 MB limit"
}
```

**Validations:**
- ✓ File required
- ✓ Max size: 10 MB
- ✓ Allowed types: JPEG, PNG, GIF
- ✓ File uploaded to ImgBB

**Status Codes:**
- 200 OK - Upload successful
- 400 Bad Request - Validation failed
- 500 Internal Server Error - Server error

---

### 2. Upload File (Document)
**Endpoint:** `POST /api/upload/file`

**Authorization:** Bearer token required (Admin or Customer role)

**Content-Type:** `multipart/form-data`

**Request:**
```bash
curl -X POST https://api.example.com/api/upload/file \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "File=@document.pdf"
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "fileName": "doc_1729177200_abc123.pdf"
  },
  "message": "File uploaded successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "data": null,
  "message": "File size exceeds 10 MB limit"
}
```

**Validations:**
- ✓ File required
- ✓ Max size: 10 MB
- ✓ File uploaded to Azure Blob Storage
- ✓ Unique filename generated

**Status Codes:**
- 200 OK - Upload successful
- 400 Bad Request - Validation failed
- 500 Internal Server Error - Server error

---

### 3. Check File Existence
**Endpoint:** `GET /api/exists`

**Authorization:** None (Public)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| fileName | string | Yes | Name of the file to check |

**Request:**
```bash
curl -X GET "https://api.example.com/api/exists?fileName=doc_1729177200_abc123.pdf"
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "exists": true
  },
  "message": "File exists"
}
```

**Response (File Not Found):**
```json
{
  "success": true,
  "data": {
    "exists": false
  },
  "message": "File does not exist"
}
```

**Response (Error):**
```json
{
  "success": false,
  "data": null,
  "message": "An error occurred while checking file existence"
}
```

**Status Codes:**
- 200 OK - Check completed
- 400 Bad Request - File name required
- 500 Internal Server Error - Server error

---

### 4. Download File
**Endpoint:** `GET /api/download`

**Authorization:** Optional (Required for full download, not for preview)

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| docId | int | Yes | - | Document ID |
| fileName | string | Yes | - | File name in storage |
| mode | string | No | "full" | "preview" or "full" |
| disposition | string | No | "attachment" | "attachment" or "inline" |

**Request (Full Download):**
```bash
curl -X GET "https://api.example.com/api/download?docId=123&fileName=doc.pdf&mode=full" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o document.pdf
```

**Request (Preview - No Auth Required):**
```bash
curl -X GET "https://api.example.com/api/download?docId=123&fileName=doc.pdf&mode=preview" \
  -o preview.pdf
```

**Response (Success):**
- Returns binary PDF file stream
- Headers include: `Accept-Ranges: bytes`, `Cache-Control: no-store` (for preview)

**Response (Error):**
```json
{
  "success": false,
  "data": null,
  "message": "File not found"
}
```

**Behaviors:**

#### Preview Mode (`mode=preview`)
- ✓ No authentication required
- ✓ First 3 pages only
- ✓ Watermarked with "ELibrary • [timestamp] UTC"
- ✓ Cache-Control: no-store
- ✓ Response header: `X-Preview-Pages: 3`

#### Full Download Mode (`mode=full`)
- ✓ Authentication required (Bearer token)
- ✓ Full document downloaded
- ✓ Publishes `DocumentDownloaded` event via RabbitMQ
- ✓ Tracks download with UserId

**Status Codes:**
- 200 OK - Download successful
- 400 Bad Request - File name required
- 401 Unauthorized - Auth required for full download
- 404 Not Found - File not found
- 500 Internal Server Error - Server error

---

## Response Data Models

### UploadResponseData
```csharp
{
  "fileName": "string" // URL or unique filename
}
```

### ExistsResponseData
```csharp
{
  "exists": true/false
}
```

---

## Error Handling

All endpoints follow the standardized error response format:

**4xx Client Errors:**
```json
{
  "success": false,
  "data": null,
  "message": "Error description"
}
```

**5xx Server Errors:**
```json
{
  "success": false,
  "data": null,
  "message": "An error occurred..."
}
```

**Common Error Messages:**
- "No image file uploaded"
- "No file uploaded"
- "File size exceeds 10 MB limit"
- "Only JPEG, PNG, or GIF files are allowed"
- "File name is required"
- "Authentication required"
- "File not found"

---

## File Limits & Constraints

| Constraint | Value |
|-----------|-------|
| Max file size | 10 MB |
| Allowed image types | JPEG, PNG, GIF |
| Preview pages | 3 (max) |
| Image storage | ImgBB |
| Document storage | Azure Blob Storage |

---

## Authentication & Authorization

### Upload Endpoints
- **Required:** Bearer token
- **Roles:** Admin, Customer
- **Scheme:** JWT Bearer

### Check Existence Endpoint
- **Required:** None (Public)

### Download Endpoint
- **Full Download:** Bearer token required
- **Preview:** No token required

---

## Event Publishing

### DocumentDownloaded Event
Published when user downloads a document (not preview):

```json
{
  "documentId": 123,
  "userId": 2,
  "fileName": "doc_1729177200_abc123.pdf",
  "downloadedAt": "2025-10-17T12:34:56Z"
}
```

**Published to:** RabbitMQ topic exchange

---

## Changes from Previous Implementation

### Before (Custom Response Classes)
```csharp
// Old response classes
UploadResponse { Success, FileName }
ExistsResponse { Success, Exists }
ErrorResponse { Success, Message }
```

### After (Standardized ApiResponse<T>)
```csharp
// New standardized responses
ApiResponse<UploadResponseData>.Ok(data, message)
ApiResponse<ExistsResponseData>.Ok(data, message)
ApiResponse<object>.Fail(message)
```

**Benefits:**
- ✓ Consistent across all microservices
- ✓ Unified error handling
- ✓ Better client-side parsing
- ✓ Standardized Swagger documentation
- ✓ Improved API discoverability

---

## Integration with SharedLibrary

The Storage Service now uses:

```csharp
using SharedLibrary.Commons;  // ApiResponse<T>
using SharedLibrary.Auths;    // ClaimsPrincipalExtensions
using SharedLibrary.Messages; // DocumentDownloaded event
```

---

## Testing Checklist

- [ ] Upload image with valid file
- [ ] Upload image with invalid file type
- [ ] Upload image exceeding size limit
- [ ] Upload file (document)
- [ ] Check file existence (exists)
- [ ] Check file existence (not exists)
- [ ] Download with authentication
- [ ] Preview without authentication
- [ ] Verify preview watermark
- [ ] Verify DocumentDownloaded event published
- [ ] All responses use ApiResponse<T>

---

## Example Client Usage

### C# Client
```csharp
using var client = new HttpClient();
client.DefaultRequestHeaders.Authorization = 
    new AuthenticationHeaderValue("Bearer", token);

var content = new MultipartFormDataContent();
var fileContent = new StreamContent(File.OpenRead("image.jpg"));
content.Add(fileContent, "File", "image.jpg");

var response = await client.PostAsync("https://api.example.com/api/upload/image", content);
var result = JsonSerializer.Deserialize<ApiResponse<UploadResponseData>>(
    await response.Content.ReadAsStringAsync()
);

if (result?.Success == true)
{
    Console.WriteLine($"Uploaded: {result.Data?.FileName}");
}
```

### JavaScript/TypeScript Client
```typescript
const formData = new FormData();
formData.append('File', fileInput.files[0]);

const response = await fetch('/api/upload/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
if (result.success) {
  console.log('File URL:', result.data.fileName);
}
```

---

## Deployment Notes

✓ No database changes required
✓ No migration needed
✓ Backward compatible (same endpoints)
✓ Response structure changed (clients may need updates)
✓ All validation logic preserved
✓ All file operations preserved
