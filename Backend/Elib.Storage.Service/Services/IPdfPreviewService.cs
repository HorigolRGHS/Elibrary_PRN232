namespace Elib.Storage.Service.Services
{
    public interface IPdfPreviewService
    {
        Task CreatePreviewWithWatermarkAsync(Stream input, Stream output, string watermark, int maxPages = 3);
    }
}
