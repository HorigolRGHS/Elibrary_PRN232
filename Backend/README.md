# ELibrary_PRN232

## API standardization with SharedLibrary

This document describes how services in the solution standardize responses, errors, pagination, JWT authentication, and audit logging using the SharedLibrary.

### 1) Standard response envelope

- Wrapper type: `SharedLibrary.Commons.ApiResponse<T>`
- JSON structure:

```
{
	"success": true|false,
	"message": "string | null",
	"data": { ... } | null
}
```

- Create responses in code:

```csharp
return Ok(ApiResponse<MyDto>.Ok(dto));
return BadRequest(ApiResponse<string>.Fail("Invalid data"));
```

Note: The current exception middleware returns a minimal JSON `{ success, error, code }` (see section 2). You can unify this to the same `ApiResponse` shape if desired (“Optional error unification”).

### 2) Global exception handling

- Register the middleware in Program.cs:

```csharp
using SharedLibrary.Commons;
// ...
app.UseGlobalException();
```

- Throw a `BusinessException` to control status code and message:

```
{
	"success": false,
	"error": "Error message",
	"code": 400|401|403|404|500...
}
```

- Throw business error:

```csharp
throw new BusinessException("Resource not found", 404);
```

Optional error unification: If you want to match `ApiResponse<T>`, adjust `ExceptionMiddleware` to return `{ success:false, message, data:null }` instead of `{ error, code }`.

### 3) Standard pagination

- Result type: `SharedLibrary.Commons.PagedResult<T>`
- Structure:

```
{
	"items": [ ... ],
	"totalCount": 123,
	"page": 1,
	"pageSize": 10
}
```

- EF Core usage:

```csharp
var query = _db.Entities.AsNoTracking().OrderByDescending(x => x.CreatedDate);
var paged = await query.ToPagedResultAsync(page, pageSize);
return Ok(ApiResponse<PagedResult<MyDto>>.Ok(paged));
```

Recommended query params: `page` (>=1), `pageSize` (1..100 per service policy); respond 200 with the standard envelope.

### 4) JWT authentication/authorization

- Configure `JwtSettings` in appsettings or user secrets:

```json
{
	"JwtSettings": {
		"Issuer": "ELibrary",
		"Audience": "ELibrary",
		"SecretKey": "your-very-strong-secret-key-32+chars",
		"ExpiryMinutes": 60
	}
}
```

- Register in Program.cs:

```csharp
using SharedLibrary.Auths;
// ...
builder.Services.AddJwtAuth(builder.Configuration);
app.UseAuthentication();
app.UseAuthorization();
```

- Restrict by role:

```csharp
[AuthorizeRole("Admin")]
public IActionResult Create(...) { ... }
```

- Issue tokens with `JwtHelper` (if needed):

```csharp
public class AuthController : ControllerBase
{
		private readonly JwtHelper _jwt;
		public AuthController(JwtHelper jwt) => _jwt = jwt;

		[HttpPost("token")]
		public IActionResult Token(int userId, string role)
				=> Ok(ApiResponse<string>.Ok(_jwt.GenerateToken(userId, role)));
}
```

### 5) Audit logging

- Register `AuditLogger` with the connection string:

```csharp
using SharedLibrary.Audits;
// ...
builder.Services.AddSingleton(sp =>
		new AuditLogger(builder.Configuration.GetConnectionString("DefaultConnection")!));
```

- Log changes when mutating data:

```csharp
await _audit.LogAsync(
		serviceName: "Catalog",
		tableName: "Document",
		action: "INSERT", // INSERT | UPDATE | DELETE | ...
		recordId: entity.Id.ToString(), // adjust to your key property
		performedBy: userId,
		oldObj: null,
		newObj: entity
);
```

Target table: `activity_svc.AuditLog` (created by the DB script). Old/new values are serialized as JSON.

### 6) Base Repository/Service (optional)

- Inherit `SharedLibrary.Repositories.BaseRepository<T>` for basic CRUD and inject via `IBaseRepository<T>`.
- Services can implement `SharedLibrary.Services.IBaseService<T>` and return `ApiResponse<T>`.

DI registration example:

```csharp
builder.Services.AddScoped<IBaseRepository<Document>, DocumentRepository>();
builder.Services.AddScoped<IBaseService<Document>, DocumentService>();
```

### 7) Common API conventions

- HTTP status:
	- 200: Success, returns `ApiResponse<T>` with `success=true`.
	- 400/401/403/404/409: Business/auth/permission errors; throw `BusinessException` with appropriate `StatusCode`.
	- 500: Unhandled server errors.
- Successful responses always wrap with `ApiResponse<T>`; for large lists, use `PagedResult<T>` inside `data`.
- Error shape: currently `{ success:false, error, code }` from the middleware. You may align it to `{ success:false, message, data:null }` if you update the middleware.
- Pagination params: `page`, `pageSize`. Enforce a max `pageSize` per service to protect the system.

### 8) Full endpoint example

```csharp
[ApiController]
[Route("api/[controller]")]
public class DocumentController : ControllerBase
{
		private readonly CatalogDb _db;
		private readonly AuditLogger _audit;
		public DocumentController(CatalogDb db, AuditLogger audit)
		{ _db = db; _audit = audit; }

		[HttpGet]
		public async Task<IActionResult> Get(int page = 1, int pageSize = 10)
		{
				var query = _db.Documents.AsNoTracking().OrderByDescending(d => d.CreatedDate);
				var paged = await query.ToPagedResultAsync(page, pageSize);
				return Ok(ApiResponse<PagedResult<Document>>.Ok(paged));
		}

		[AuthorizeRole("Admin")]
		[HttpPost]
		public async Task<IActionResult> Create(CreateDocumentDto dto) // replace with your DTO
		{
				var entity = new Document { Title = dto.Title /* ... */ };
				_db.Add(entity);
				await _db.SaveChangesAsync();

				// Extract user id from JWT (sub claim)
				var sub = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
				int? userId = int.TryParse(sub, out var uid) ? uid : null;

				await _audit.LogAsync("Catalog", "Document", "INSERT", entity.Id.ToString(), userId, null, entity);
				return Ok(ApiResponse<Document>.Ok(entity, "Created"));
		}
}
```

### 9) Quick tests (Windows PowerShell 5.1)

```powershell
# Successful API call
Invoke-RestMethod -Method Get -Uri "https://localhost:5001/api/document?page=1&pageSize=5"

# Call that triggers a BusinessException (e.g., not found)
try {
	Invoke-RestMethod -Method Get -Uri "https://localhost:5001/api/document/99999"
} catch {
	$resp = $_.Exception.Response
	if ($resp) { $reader = New-Object System.IO.StreamReader($resp.GetResponseStream()); $reader.ReadToEnd() }
	else { $_ }
}
```

---

If you want, I can update `ExceptionMiddleware` to align the error format to `ApiResponse<object>` and add service-specific examples.