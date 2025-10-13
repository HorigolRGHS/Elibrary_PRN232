using AutoMapper;
using Elib.Interaction.Service.DTOs;
using Elib.Interaction.Service.Models;

namespace Elib.Interaction.Service.Profiles
{
    public class RatingProfile : Profile
    {
        public RatingProfile()
        {
            // Entity -> DTO
            CreateMap<Rating, RatingReadDTO>();

            // Create DTO -> Entity
            CreateMap<RatingCreateDTO, Rating>()
                .ForMember(d => d.CreatedDate, o => o.MapFrom(_ => DateTime.UtcNow))
                .ForMember(d => d.UpdatedDate, o => o.Ignore());

            // Update DTO -> Entity
            CreateMap<RatingUpdateDTO, Rating>()
                .ForMember(d => d.UpdatedDate, o => o.MapFrom(_ => DateTime.UtcNow))
                .ForMember(d => d.CreatedDate, o => o.Ignore())
                .ForMember(d => d.StarRating, o => o.Condition((src, dest, srcMember) => srcMember != null))
                .ForMember(d => d.Review, o => o.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
