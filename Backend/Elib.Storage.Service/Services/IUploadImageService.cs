namespace Elib.Storage.Service.Services
{
    public interface IUploadImageService
    {
        Task<string> UploadImageAsync(IFormFile file);

    }
}
