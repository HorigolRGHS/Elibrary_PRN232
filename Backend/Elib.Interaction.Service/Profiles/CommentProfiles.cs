using AutoMapper;
using Elib.Interaction.Service.DTOs.Comment;
using Elib.Interaction.Service.Models;

namespace Elib.Interaction.Service.Profiles
{
    public class CommentProfile : Profile
    {
        public CommentProfile()
        {
            CreateMap<Comment, CommentListDTO>();
            CreateMap<Comment, CommentReadDTO>();

            CreateMap<CommentCreateDTO, Comment>()
                .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.UpdatedDate, opt => opt.Ignore());

            CreateMap<CommentUpdateDTO, Comment>()
                .ForMember(dest => dest.CommentId, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedDate, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore());
        }
    }
}
