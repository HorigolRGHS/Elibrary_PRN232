namespace Elib.Storage.Service.Services
{
    public interface IBlobService
    {
        Task<string> UploadFileAsync(Stream fileStream, string fileName);
        Task<bool> FileExistsAsync(string fileName);
        Task<Stream?> DownloadFileAsync(string fileName);
        Task<(Stream?, string?)> DownloadFileStreamAsync(string fileName);
        Task<(Stream? stream, string? contentType, long? length, string? etag)> OpenReadWithMetaAsync(string fileName);
        Task<string> GetUniqueFileNameAsync(string originalFileName);
    }   
}
