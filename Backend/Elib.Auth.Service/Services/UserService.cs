using AutoMapper;
using AutoMapper.QueryableExtensions;
using Elib.Auth.Service.DTOs.Admin;
using Elib.Auth.Service.Models;
using Elib.Auth.Service.Repositories;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Commons;

namespace Elib.Auth.Service.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepo;
        private readonly IMapper _mapper;
        public UserService(IUserRepository userRepo, IMapper mapper)
        {
            _userRepo = userRepo;
            _mapper = mapper;
        }

        public async Task<ApiResponse<User>> GetByEmailAsync(string email)
        {
            var user = await _userRepo.GetByEmailAsync(email);
            return user == null ? ApiResponse<User>.Fail("Not found") : ApiResponse<User>.Ok(user);
        }

        public IQueryable<UserListItemDTO> GetAll(int userId)
        {
            return _userRepo.AsQueryable()
       .Where(u => u.UserId != userId)
       .ProjectTo<UserListItemDTO>(_mapper.ConfigurationProvider);
        }

        public async Task<ApiResponse<string>> UpdateUserAsync(UpdateUserAccountDTO dto)
        {
            var user = await _userRepo.GetByIdAsync(dto.UserId);
            if (user == null || user.Role != UserRole.Customer)
                return ApiResponse<string>.Fail("User not found or not a customer");
            user.FullName = dto.FullName;
            if (user.Active != dto.Active)
            {
                user.Active = dto.Active;
                user.DeletedDate = dto.Active ? null : DateTime.UtcNow;
            }
            user.UpdatedDate = DateTime.UtcNow;
            await _userRepo.UpdateAsync(user);
            return ApiResponse<string>.Ok(null, "Update user successfully");
        }

        public async Task<ApiResponse<string>> DeleteUserAsync(int userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                return ApiResponse<string>.Fail("User not found");
            await _userRepo.DeleteAsync(user);
            return ApiResponse<string>.Ok(null, "Delete user successfully");
        }
    }
}
