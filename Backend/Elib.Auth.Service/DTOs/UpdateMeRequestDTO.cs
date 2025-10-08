using System.ComponentModel.DataAnnotations;

namespace Elib.Auth.Service.DTOs
{
    public sealed class UpdateMeRequestDTO
    {
        [MaxLength(100, ErrorMessage = "Full name must not exceed 100 characters")]
        public string? FullName { get; init; }

        [Url(ErrorMessage = "ImageUrl must be a valid URL")]
        [MaxLength(500, ErrorMessage = "ImageUrl must not exceed 500 characters")]
        public string? ImageUrl { get; init; }
    }
}
