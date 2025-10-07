using Elib.Activity.Service.DTOs;
using Elib.Activity.Service.Models;
using AutoMapper;

namespace Elib.Activity.Service.Profiles
{
    public class NotificationProfile : Profile
    {
        public NotificationProfile()
        {
            // Model → DTO 
            CreateMap<Notification, NotificationDTO>().ReverseMap();

            // DTO → Model
            CreateMap<CreateNotificationDTO, Notification>()
                .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(_ => "Pending"))
                .ForMember(dest => dest.UpdatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore()); 

            // DTO → Model
            CreateMap<UpdateNotificationDTO, Notification>()
                .ForMember(dest => dest.UpdatedDate, opt => opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.CreatedDate, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore());

            // NotificationView → DTO
            CreateMap<NotificationView, ViewNotificationDTO>().ReverseMap();
        }
    }
}
