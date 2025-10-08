using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace Elib.Storage.Service.Services
{
    public class AzureStorageService : IBlobService
    {
        private readonly BlobContainerClient _containerClient;

        public AzureStorageService(IConfiguration configuration)
        {
            string connectionString = configuration["AzureBlobStorage:ConnectionString"];
            string containerName = configuration["AzureBlobStorage:ContainerName"];

            var blobServiceClient = new BlobServiceClient(connectionString);
            _containerClient = blobServiceClient.GetBlobContainerClient(containerName);
        }

        public async Task<Stream?> DownloadFileAsync(string fileName)
        {
            var (s, _, _, _) = await OpenReadWithMetaAsync(fileName);
            return s;
        }

        public async Task<(Stream? stream, string? contentType, long? length, string? etag)> OpenReadWithMetaAsync(string fileName)
        {
            var blobClient = _containerClient.GetBlobClient(fileName);
            if (!await blobClient.ExistsAsync()) return (null, null, null, null);

            var props = await blobClient.GetPropertiesAsync();

            var stream = await blobClient.OpenReadAsync(new BlobOpenReadOptions(allowModifications: false));
            return (stream, props.Value.ContentType, props.Value.ContentLength, props.Value.ETag.ToString());
        }

        public async Task<(Stream?, string?)> DownloadFileStreamAsync(string fileName)
        {
            var (s, ct, _, _) = await OpenReadWithMetaAsync(fileName);
            return (s, ct);
        }

        public async Task<bool> FileExistsAsync(string fileName)
        {
            var blobClient = _containerClient.GetBlobClient(fileName);
            return await blobClient.ExistsAsync();
        }

        public async Task<string> GetUniqueFileNameAsync(string originalFileName)
        {
            var name = Path.GetFileNameWithoutExtension(originalFileName);
            var ext = Path.GetExtension(originalFileName);
            return $"{name}_{Guid.NewGuid():N}{ext}";
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName)
        {
            var blobClient = _containerClient.GetBlobClient(fileName);

            var headers = new BlobHttpHeaders
            {
                ContentType = TryGetContentType(fileName) ?? "application/octet-stream"
            };

            await blobClient.UploadAsync(fileStream, new BlobUploadOptions
            {
                HttpHeaders = headers,
                TransferOptions = new()
                {
                },
            });

            return blobClient.Uri.ToString();

        }

        private static string? TryGetContentType(string fileName)
        {
            var ext = Path.GetExtension(fileName).ToLowerInvariant();
            return ext switch
            {
                ".pdf" => "application/pdf",
                ".png" => "image/png",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".gif" => "image/gif",
                ".txt" => "text/plain",
                ".json" => "application/json",
                _ => null
            };
        }
    }
}
