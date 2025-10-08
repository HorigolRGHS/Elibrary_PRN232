using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Elib.Storage.Service.Services;
using MassTransit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Net.Http.Headers;
using SharedLibrary.Auths;
using SharedLibrary.Messages; 
using Swashbuckle.AspNetCore.Annotations;

namespace Elib.Storage.Service.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StorageController : ControllerBase
    {
        private readonly IUploadImageService _imageService;
        private readonly IBlobService _blobService;
        private readonly IPdfPreviewService _pdfService;
        private readonly IPublishEndpoint _publish;
        private readonly ILogger<StorageController> _logger;

        private readonly long _maxFileSize = 10 * 1024 * 1024; // 10 MB
        private readonly string[] _allowedImageTypes = { "image/jpeg", "image/png", "image/gif" };

        public StorageController(
            IUploadImageService imageService,
            IBlobService blobService,
            IPdfPreviewService pdfService,
            IPublishEndpoint publish,
            ILogger<StorageController> logger)
        {
            _imageService = imageService;
            _blobService = blobService;
            _pdfService = pdfService;
            _publish = publish;
            _logger = logger;
        }

        [HttpPost("upload/image")]
        [Consumes("multipart/form-data")]
        [SwaggerResponse(200, "Image uploaded successfully", Type = typeof(UploadResponse))]
        [SwaggerResponse(400, "Invalid file or request", Type = typeof(ErrorResponse))]
        [SwaggerResponse(500, "Server error", Type = typeof(ErrorResponse))]
        public async Task<IActionResult> UploadImage([FromForm] UploadImageForm file)
        {
            try
            {
                if (file?.File == null || file.File.Length == 0)
                    return BadRequest(new ErrorResponse { Success = false, Message = "No image file uploaded" });

                if (file.File.Length > _maxFileSize)
                    return BadRequest(new ErrorResponse { Success = false, Message = "File size exceeds 10 MB limit" });

                if (!_allowedImageTypes.Contains(file.File.ContentType))
                    return BadRequest(new ErrorResponse { Success = false, Message = "Only JPEG, PNG, or GIF files are allowed" });

                var imageUrl = await _imageService.UploadImageAsync(file.File);
                _logger.LogInformation("Image uploaded successfully to ImgBB: {ImageUrl}", imageUrl);
                return Ok(new UploadResponse { Success = true, Url = imageUrl });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("Invalid argument: {Message}", ex.Message);
                return BadRequest(new ErrorResponse { Success = false, Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading image to ImgBB");
                return StatusCode(500, new ErrorResponse { Success = false, Message = "An error occurred while uploading the image" });
            }
        }

        [HttpPost("upload/file")]
        [Consumes("multipart/form-data")]
        [SwaggerResponse(200, "File uploaded successfully", Type = typeof(UploadResponse))]
        [SwaggerResponse(400, "Invalid file or request", Type = typeof(ErrorResponse))]
        [SwaggerResponse(500, "Server error", Type = typeof(ErrorResponse))]
        public async Task<IActionResult> UploadFile([FromForm] UploadFileForm file)
        {
            try
            {
                if (file?.File == null || file.File.Length == 0)
                    return BadRequest(new ErrorResponse { Success = false, Message = "No file uploaded" });

                if (file.File.Length > _maxFileSize)
                    return BadRequest(new ErrorResponse { Success = false, Message = "File size exceeds 10 MB limit" });

                await using var stream = file.File.OpenReadStream();
                var uniqueFileName = await _blobService.GetUniqueFileNameAsync(file.File.FileName);
                var fileUrl = await _blobService.UploadFileAsync(stream, uniqueFileName);
                _logger.LogInformation("File uploaded successfully to Azure Blob: {FileUrl}", fileUrl);
                return Ok(new UploadResponse { Success = true, Url = fileUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file to Azure Blob");
                return StatusCode(500, new ErrorResponse { Success = false, Message = "An error occurred while uploading the file" });
            }
        }

        /// <summary>Checks if a file exists in Azure Blob Storage.</summary>
        [HttpGet("exists")]
        [SwaggerResponse(200, "File existence check result", Type = typeof(ExistsResponse))]
        [SwaggerResponse(400, "Invalid file name", Type = typeof(ErrorResponse))]
        [SwaggerResponse(500, "Server error", Type = typeof(ErrorResponse))]
        public async Task<IActionResult> FileExists([FromQuery] string fileName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(fileName))
                    return BadRequest(new ErrorResponse { Success = false, Message = "File name is required" });

                var exists = await _blobService.FileExistsAsync(fileName);
                return Ok(new ExistsResponse { Success = true, Exists = exists });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking file existence");
                return StatusCode(500, new ErrorResponse { Success = false, Message = "An error occurred while checking file existence" });
            }
        }

        [HttpGet("download")]
        [Produces("application/pdf")]
        [SwaggerResponse(200)]
        [SwaggerResponse(400, Type = typeof(ErrorResponse))]
        [SwaggerResponse(404, Type = typeof(ErrorResponse))]
        [SwaggerResponse(500, Type = typeof(ErrorResponse))]
        public async Task<IActionResult> DownloadFile(
            [FromQuery] int docId,
            [FromQuery] string fileName,
            [FromQuery] string mode = "full",
            [FromQuery] string? disposition = null)
        {
            if (string.IsNullOrWhiteSpace(fileName))
                return BadRequest(new ErrorResponse { Success = false, Message = "File name is required" });

            try
            {
                Response.Headers["Accept-Ranges"] = "bytes";

                var userId = User.GetUserIdOrThrow();
                var userName = User.Identity?.Name ?? "Guest";

                if (string.Equals(mode, "preview", StringComparison.OrdinalIgnoreCase))
                {
                    var (srcStream, _) = await _blobService.DownloadFileStreamAsync(fileName);
                    if (srcStream == null)
                        return NotFound(new ErrorResponse { Success = false, Message = "File not found" });

                    await using (srcStream)
                    {
                        var ms = new MemoryStream();
                        var watermark = $"PREVIEW • {userName} • {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC";
                        await _pdfService.CreatePreviewWithWatermarkAsync(srcStream, ms, watermark, maxPages: 3);
                        ms.Position = 0;

                        Response.Headers["Cache-Control"] = "no-store";
                        Response.Headers["X-Preview-Pages"] = "3";

                        var cd = new ContentDispositionHeaderValue("inline")
                        {
                            FileNameStar = System.IO.Path.GetFileNameWithoutExtension(fileName) + "_preview.pdf"
                        };
                        Response.Headers[HeaderNames.ContentDisposition] = cd.ToString();

                        return File(ms, "application/pdf", enableRangeProcessing: true);
                    }
                }
                else
                {
                    var (stream, contentType) = await _blobService.DownloadFileStreamAsync(fileName);
                    if (stream == null)
                        return NotFound(new ErrorResponse { Success = false, Message = "File not found" });

                    var disp = string.IsNullOrEmpty(disposition) ? "attachment" : disposition;
                    var cd = new ContentDispositionHeaderValue(disp)
                    {
                        FileNameStar = System.IO.Path.GetFileName(fileName)
                    };
                    Response.Headers[HeaderNames.ContentDisposition] = cd.ToString();

                    Response.OnCompleted(async () =>
                    {
                        try
                        {
                            await _publish.Publish(new DocumentDownloaded(
                                DocumentId: docId,
                                UserId: userId,
                                FileName: fileName,
                                DownloadedAt: DateTime.UtcNow
                            ));
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Publish DocumentDownloaded failed for {File}", fileName);
                        }
                    });

                    return File(stream, contentType ?? "application/pdf", enableRangeProcessing: true);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading file {File}", fileName);
                return StatusCode(500, new ErrorResponse { Success = false, Message = "An error occurred while downloading the file" });
            }
        }
    }

    public class UploadResponse
    {
        public bool Success { get; set; }
        public string Url { get; set; } = default!;
    }

    public class ExistsResponse
    {
        public bool Success { get; set; }
        public bool Exists { get; set; }
    }

    public class ErrorResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = default!;
    }

    public class UploadImageForm
    {
        [Required]
        public IFormFile File { get; set; } = default!;
    }

    public class UploadFileForm
    {
        [Required]
        public IFormFile File { get; set; } = default!;
    }
}
