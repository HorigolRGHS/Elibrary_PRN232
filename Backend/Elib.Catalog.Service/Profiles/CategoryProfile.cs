using AutoMapper;
using Elib.Catalog.Service.DTOs;
using Elib.Catalog.Service.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Elib.Catalog.Service.Profiles
{
    public class CategoryProfile : Profile
    {
        public CategoryProfile()
        {
            // Entity -> DTO
            CreateMap<Category, CategoryReadDTO>();
            CreateMap<Category, CategoryCreateDTO>();
            CreateMap<Category, CategoryUpdateDTO>();

            // Create DTO -> Entity
            CreateMap<CategoryCreateDTO, Category>()
                .ForMember(d => d.CreatedDate, o => o.MapFrom(_ => DateTime.UtcNow))
                .ForMember(d => d.UpdatedDate, o => o.Ignore())
                .ForMember(d => d.Documents, o => o.Ignore());

            // Update DTO -> Entity
            CreateMap<CategoryUpdateDTO, Category>()
                .ForMember(d => d.UpdatedDate, o => o.MapFrom(_ => DateTime.UtcNow))
                .ForMember(d => d.CreatedDate, o => o.Ignore())
                .ForMember(d => d.Documents, o => o.Ignore());
        }
    }
}
