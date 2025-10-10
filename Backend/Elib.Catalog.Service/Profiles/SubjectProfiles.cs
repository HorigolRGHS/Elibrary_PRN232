using AutoMapper;
using Elib.Catalog.Service.Models;
using Elib.Catalog.Service.DTOs;

namespace Elib.Catalog.Service.Profiles
{
    public class SubjectProfiles : Profile
    {
        public SubjectProfiles()
        {
            CreateMap<Subject, SubjectReadDTO>();
            CreateMap<Subject, SubjectCreateDTO>();
            CreateMap<Subject, SubjectUpdateDTO>();

            CreateMap<SubjectCreateDTO, Subject>()
                .ForMember(dest => dest.SubjectId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.Documents, opt => opt.Ignore());

            CreateMap<SubjectUpdateDTO, Subject>()
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedDate, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Documents, opt => opt.Ignore());

            CreateMap<Document, DocumentInSubjectDTO>();
        }
    }
}