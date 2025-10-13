
using System.Text.Json.Nodes;

namespace Elib.Storage.Service.Services
{
    public class ImgBBService : IUploadImageService
    {
        private readonly string _apiKey;
        public ImgBBService(IConfiguration configuration)
        {
            _apiKey = configuration[key: "ImgBBApiKey"]!; // Lấy API key từ file cấu hình appsetting.json 
        }

        public async Task<string> UploadImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("No file uploaded");

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var fileBytes = ms.ToArray();
            string base64Image = Convert.ToBase64String(fileBytes);

            using var httpClient = new HttpClient
            {
                Timeout = TimeSpan.FromMinutes(5) // tăng lên từ mặc định 100s → 5 phút (tạm thời để debug)
            };
            var content = new MultipartFormDataContent();
            content.Add(new StringContent(_apiKey), "key");
            content.Add(new StringContent(base64Image), "image");
            content.Add(new StringContent(file.FileName), "name");

            Console.WriteLine("🚀 Gửi request đến ImgBB...");

            var response = await httpClient.PostAsync("https://api.imgbb.com/1/upload", content);

            Console.WriteLine("✅ ImgBB đã phản hồi.");

            response.EnsureSuccessStatusCode();

            var responseString = await response.Content.ReadAsStringAsync();
            var json = JsonObject.Parse(responseString);

            var imageUrl = json["data"]?["url"]?.ToString();
            Console.WriteLine($"🔗 Link ảnh từ ImgBB: {imageUrl}");

            return imageUrl;
        }
    }
}
