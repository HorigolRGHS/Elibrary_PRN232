using Azure.Storage.Blobs;

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
            var blobClient = _containerClient.GetBlobClient(fileName);

            if (!await blobClient.ExistsAsync())
            {
                return null;
            }

            var downloadStream = await blobClient.OpenReadAsync();
            return downloadStream;
        }

        public async Task<(Stream?, string?)> DownloadFileStreamAsync(string fileName)
        {
            var blobClient = _containerClient.GetBlobClient(fileName);
            if (!await blobClient.ExistsAsync())
            {
                return (null, null);
            }

            var properties = await blobClient.GetPropertiesAsync();
            var contentType = properties.Value.ContentType;

            var stream = await blobClient.OpenReadAsync();
            return (stream, contentType);
        }

        public async Task<bool> FileExistsAsync(string fileName)
        {
            var blobClient = _containerClient.GetBlobClient(fileName);
            return await blobClient.ExistsAsync();
        }

        public async Task<string> GetUniqueFileNameAsync(string originalFileName)
        {
            string fileName = Path.GetFileNameWithoutExtension(originalFileName);
            string extension = Path.GetExtension(originalFileName);
            string uniqueFileName = originalFileName;
            int counter = 1;

            while (await FileExistsAsync(uniqueFileName))
            {
                uniqueFileName = $"{fileName}_{Guid.NewGuid().ToString("N").Substring(0, 8)}{extension}";
                counter++;
            }

            return uniqueFileName;
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName)
        {
            var blobClient = _containerClient.GetBlobClient(fileName);
            await blobClient.UploadAsync(fileStream, overwrite: true);

            return blobClient.Uri.ToString();
        }
    }
}
