using Elib.Auth.Service.Models;
using SharedLibrary.Commons;
using Elib.Auth.Service.Repositories;

namespace Elib.Auth.Service.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repo;

        public UserService(IUserRepository repo)
        {
            _repo = repo;
        }

        public async Task<ApiResponse<User>> CreateAsync(User entity)
        {
            await _repo.AddAsync(entity);
            await _repo.SaveChangesAsync();
            return ApiResponse<User>.Ok(entity);
        }

        public async Task<ApiResponse<bool>> DeleteAsync(int id)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null)
                return ApiResponse<bool>.Fail("User not found");

            await _repo.DeleteAsync(existing);
            await _repo.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true);
        }

        public async Task<ApiResponse<IEnumerable<User>>> GetAllAsync()
        {
            var items = await _repo.GetAllAsync();
            return ApiResponse<IEnumerable<User>>.Ok(items);
        }

        public async Task<ApiResponse<User>> GetByEmailAsync(string email)
        {
            var item = await _repo.GetByEmailAsync(email);
            if (item == null) return ApiResponse<User>.Fail("User not found");
            return ApiResponse<User>.Ok(item);
        }

        public async Task<ApiResponse<User>> GetByIdAsync(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null) return ApiResponse<User>.Fail("User not found");
            return ApiResponse<User>.Ok(item);
        }

        public async Task<ApiResponse<User>> UpdateAsync(User entity)
        {
            var existing = await _repo.GetByIdAsync(entity.UserId);
            if (existing == null)
                return ApiResponse<User>.Fail("User not found");

   
            existing.FullName = entity.FullName;
            existing.Email = entity.Email;
            existing.ImageUrl = entity.ImageUrl;
            existing.Role = entity.Role;
            existing.Active = entity.Active;
            existing.UpdatedDate = DateTime.UtcNow;

            await _repo.UpdateAsync(existing);
            await _repo.SaveChangesAsync();
            return ApiResponse<User>.Ok(existing);
        }
    }
}
