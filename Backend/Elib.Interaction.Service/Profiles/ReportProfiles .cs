using AutoMapper;
using Elib.Interaction.Service.DTOs;
using Elib.Interaction.Service.Models;

namespace Elib.Interaction.Service.Profiles
{
    public class ReportProfile : Profile
    {
        public ReportProfile()
        {
            // Model ↔ DTO
            CreateMap<Report, ReportDTO>()
                .ForMember(dest => dest.CreatedByName, opt => opt.Ignore())
                .ReverseMap();

            // DTO → Model (Create)
            CreateMap<ReportCreateDTO, Report>()
                .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(_ => "Pending"))
                .ForMember(dest => dest.UpdatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore()); 

            // DTO → Model (Update)
            CreateMap<ReportUpdateDTO, Report>()
                .ForMember(dest => dest.UpdatedDate, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.Reason, opt => opt.Ignore())
                .ForMember(dest => dest.DocumentId, opt => opt.Ignore());
        }
    }
}