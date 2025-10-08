using AutoMapper;
using Elib.Catalog.Service.DTOs;
using Elib.Catalog.Service.Models;

namespace Elib.Catalog.Service.Profiles
{
    public class DocumentProfile : Profile
    {
        public DocumentProfile()
        {
            CreateMap<Document, UserDocumentItemDTO>()
               .ForMember(dest => dest.CategoryName,
                   opt => opt.MapFrom(src => src.Category != null ? src.Category.CategoryName : null))
               .ForMember(dest => dest.SubjectName,
                   opt => opt.MapFrom(src => src.Subject != null ? src.Subject.SubjectName : null));

            CreateMap<Document, UserDocumentListDTO>()
                .ForMember(dest => dest.CategoryName,
                    opt => opt.MapFrom(src => src.Category != null ? src.Category.CategoryName : null))
                .ForMember(dest => dest.SubjectName,
                    opt => opt.MapFrom(src => src.Subject != null ? src.Subject.SubjectName : null));

            CreateMap<CreateDocumentDTO, Document>()
                .ForMember(dest => dest.DocumentId, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Pending"))
                .ForMember(dest => dest.ViewCount, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.DownloadCount, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore()) 
                .ForMember(dest => dest.UpdatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedDate, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.Subject, opt => opt.Ignore());

            CreateMap<UpdateDocumentDTO, Document>()
                .ForMember(dest => dest.DocumentId, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ForMember(dest => dest.ViewCount, opt => opt.Ignore())
                .ForMember(dest => dest.DownloadCount, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedDate, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.DeletedDate, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedBy, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.Subject, opt => opt.Ignore());

            CreateMap<Document, AdminDocumentItemDTO>()
                .ForMember(dest => dest.CategoryName,
                    opt => opt.MapFrom(src => src.Category != null ? src.Category.CategoryName : null))
                .ForMember(dest => dest.SubjectName,
                    opt => opt.MapFrom(src => src.Subject != null ? src.Subject.SubjectName : null))
                .ForMember(dest => dest.CreatedByUsername, opt => opt.Ignore()) 
                .ForMember(dest => dest.DeletedByUsername, opt => opt.Ignore()); 

            CreateMap<Document, AdminDocumentListDTO>()
                .ForMember(dest => dest.CategoryName,
                    opt => opt.MapFrom(src => src.Category != null ? src.Category.CategoryName : null))
                .ForMember(dest => dest.SubjectName,
                    opt => opt.MapFrom(src => src.Subject != null ? src.Subject.SubjectName : null))
                .ForMember(dest => dest.CreatedByUsername, opt => opt.Ignore()); 
        }
    }
}
