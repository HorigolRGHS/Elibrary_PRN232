### Gateway overview
- auth service: prefix `/auth` → downstream `/api/{…}` (port 7001)
- catalog service: prefix `/catalog` → downstream `/{…}` (port 7002)
- activity service: prefix `/activity` → downstream `/{…}` (port 7003)
- interaction service: prefix `/interaction` → downstream `/api/{…}` (port 7004)
- storage service: prefix `/file` → downstream `/{…}` (port 7005)

Auth service (via /auth)
- POST /auth/login
  - Body:
    ```json
    { "Email": "user@example.com", "Password": "string", "RememberMe": false }
    ```
- POST /auth/register
  - Body:
    ```json
    { "FullName": "string", "Email": "user@example.com", "Password": "Abc12345" }
    ```
- GET /auth/confirm-registration
  - Query: email, token
- POST /auth/forgot-password
  - Body:
    ```json
    { "Email": "user@example.com" }
    ```
- POST /auth/reset-password
  - Body:
    ```json
    { "Token": "string", "Email": "user@example.com", "NewPassword": "Abc12345" }
    ```
- GET /auth/auth/exists
  - Query: email
- GET /auth/me
- PUT /auth/me
  - Body:
    ```json
    { "FullName": "string?", "ImageUrl": "https://..." }
    ```
- Admin users (require Admin)
  - GET /auth/api/users
    - Query: typical paging/sorting if implemented
  - GET /auth/api/users/{id}
  - GET /auth/api/users/{email}
  - PUT /auth/api/users
    - Body: UpdateUserAccountDTO (fields per implementation)
  - DELETE /auth/api/users/{userId}

Catalog service (via /catalog)
- Documents
  - GET /catalog/api/documents
  - GET /catalog/api/documents/{id}
  - GET /catalog/api/documents/admin (Admin; OData enabled)
  - GET /catalog/api/documents/admin/{id} (Admin)
  - POST /catalog/api/documents (Authorize)
    - Body:
      ```json
      {
        "Title": "string",
        "Description": "string?",
        "FileUrl": "string",
        "CategoryId": 1,
        "SubjectId": 1
      }
      ```
  - PATCH /catalog/api/documents/{id} (Admin,Customer)
    - Body:
      ```json
      {
        "Title": "string?",
        "Description": "string?",
        "FileUrl": "string?",
        "CategoryId": 1,
        "SubjectId": 1
      }
      ```
  - DELETE /catalog/api/documents/{id} (Admin,Customer)
  - POST /catalog/api/documents/{id}/approve (Admin)
    - Body:
      ```json
      { "Accept": true, "Reason": "string?" }
      ```
  - POST /catalog/api/documents/{id}/download (Authorize)
    - No body. Tracks download; returns fileUrl.
- Subjects
  - GET /catalog/api/subjects
  - GET /catalog/api/subjects/{id}
  - POST /catalog/api/subjects (Admin)
    - Body:
      ```json
      { "SubjectName":"string", "Description":"string?", "ImageUrl":"string" }
      ```
  - PUT /catalog/api/subjects/{id} (Admin)
    - Body:
      ```json
      { "SubjectName":"string", "Description":"string?", "ImageUrl":"string" }
      ```
  - DELETE /catalog/api/subjects/{id} (Admin)
- Categories
  - GET /catalog/api/categories
  - GET /catalog/api/categories({key})
  - POST /catalog/api/categories (Admin)
    - Body:
      ```json
      { "CategoryName":"string", "Description":"string?" }
      ```
  - PUT /catalog/api/categories({key}) (Admin)
    - Body:
      ```json
      { "CategoryName":"string?", "Description":"string?" }
      ```
  - DELETE /catalog/api/categories({key}) (Admin)

Interaction service (via /interaction)
- Comments
  - GET /interaction/api/comments/{documentId}
  - GET /interaction/api/comments/detail/{id}
  - POST /interaction/api/comments
    - Body:
      ```json
      { "DocumentId": 1, "Content": "string", "CreatedBy": 1 }
      ```
  - PUT /interaction/api/comments/{id}
    - Body:
      ```json
      { "Content": "string" }
      ```
  - DELETE /interaction/api/comments/{id}
- Ratings
  - GET /interaction/api/ratings
  - GET /interaction/api/ratings({key})
  - POST /interaction/api/ratings (Customer)
    - Body:
      ```json
      { "DocumentId": 1, "StarRating": 5, "Review": "string?", "CreatedBy": 1 }
      ```
  - PUT /interaction/api/ratings({key}) (Customer)
    - Body:
      ```json
      { "DocumentId": 1, "StarRating": 4, "Review": "string?" }
      ```
  - DELETE /interaction/api/ratings({key}) (Customer)
- Reports
  - GET /interaction/api/reports
  - GET /interaction/api/reports/{id}
  - POST /interaction/api/reports (Customer,Admin)
    - Body:
      ```json
      { "DocumentId": 1, "Reason": "string" }
      ```
  - PUT /interaction/api/reports/{id} (Admin)
    - Body: ReportUpdateDTO (status/reason as implemented)
  - DELETE /interaction/api/reports/{id} (Admin)
- Statistics (Admin)
  - GET /interaction/api/statistics/report-count
    - Query: status?
  - GET /interaction/api/statistics/top-ratings
    - Query: take=5
  - GET /interaction/api/statistics/summary
    - Query: top=5, reportStatus?

Activity service (via /activity)
- Downloads
  - GET /activity/api/downloads/my-history (Authorize)
    - Query: skip or $skip, top or $top, includeCount
  - GET /activity/api/downloads/top (Anonymous)
    - Query: take, from, to
- Notifications
  - Typical CRUD under /activity/api/notifications if exposed (not fully listed here)

Storage service (via /file)
- POST /file/api/upload/image (multipart/form-data; Admin,Customer)
  - Form fields: file
- POST /file/api/upload/file (multipart/form-data; Admin,Customer)
  - Form fields: file
- GET /file/api/exists
  - Query: container, path (and/or blob identifiers per implementation)
- GET /file/api/download
  - Query: container, path; returns application/pdf

Notes
- All endpoints return a standard envelope `ApiResponse<T>` where implemented.
- Auth-protected routes require Bearer JWT; some require specific roles as noted.
- OData-style keys like `({key})` are used by some catalog endpoints.