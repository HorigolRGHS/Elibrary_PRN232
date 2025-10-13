using AutoMapper;
using Elib.Auth.Service.DTOs.Admin;
using Elib.Auth.Service.Models;

namespace Elib.Auth.Service.Profiles
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<Models.User, DTOs.RegisterRequestDTO>();
            CreateMap<Models.User, DTOs.UserInfoDTO>();
            CreateMap<User, UserListItemDTO>();

            CreateMap<DTOs.RegisterRequestDTO, Models.User>();
            CreateMap<UserListItemDTO, User>();
            CreateMap<DTOs.UserInfoDTO, Models.User>();
            CreateMap<UpdateUserAccountDTO, User>();
        }
    }
}
