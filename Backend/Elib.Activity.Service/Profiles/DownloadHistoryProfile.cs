using AutoMapper;
using Elib.Activity.Service.DTOs;
using Elib.Activity.Service.Models;

namespace Elib.Activity.Service.Profiles
{
    public class DownloadHistoryProfile : Profile
    {
        public DownloadHistoryProfile()
        {
            CreateMap<DownloadHistory, DownloadRecordDTO>();
            CreateMap<DownloadHistory, UserDownloadHistoryResponseDTO>();
            CreateMap<DownloadRecordDTO, DownloadHistory>();
        }
    }
}
