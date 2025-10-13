using Elib.Auth.Service.DTOs;
using Elib.Auth.Service.DTOs.Admin;
using Elib.Auth.Service.Models;
using Elib.Auth.Service.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.EntityFrameworkCore;
using SharedLibrary.Commons;
using System.Security.Claims;

namespace Elib.Auth.Service.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "Admin")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<PagedResult<UserListItemDTO>>>> GetUsers(
     ODataQueryOptions<UserListItemDTO> options)
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var query = _userService.GetAll(currentUserId);

            var querySettings = new ODataQuerySettings
            {
                HandleNullPropagation = HandleNullPropagationOption.False
            };

            IQueryable filteredQuery = query;
            if (options.Filter != null)
                filteredQuery = options.Filter.ApplyTo(filteredQuery, querySettings);

          
            if (options.OrderBy != null)
                filteredQuery = options.OrderBy.ApplyTo(filteredQuery, querySettings);

            var typedQuery = filteredQuery.Cast<UserListItemDTO>();

            var totalCount = await typedQuery.CountAsync();

      
            if (options.Skip != null)
                filteredQuery = options.Skip.ApplyTo(typedQuery, querySettings);
            if (options.Top != null)
                filteredQuery = options.Top.ApplyTo(filteredQuery, querySettings);

            typedQuery = filteredQuery.Cast<UserListItemDTO>();


            int pageSize = 10;
            int page = 1;
            int skip = 0;

            if (Request.Query.ContainsKey("$top"))
                int.TryParse(Request.Query["$top"], out pageSize);
            if (Request.Query.ContainsKey("$skip"))
                int.TryParse(Request.Query["$skip"], out skip);
            if (pageSize > 0)
                page = (skip / pageSize) + 1;


            var items = await typedQuery.ToListAsync();

            var result = new PagedResult<UserListItemDTO>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return Ok(ApiResponse<PagedResult<UserListItemDTO>>.Ok(result));
        }



        [HttpPut]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateUser([FromBody] UpdateUserAccountDTO dto)
        {
            var result = await _userService.UpdateUserAsync(dto);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        [HttpDelete("{userId}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteUser(int userId)
        {
            var result = await _userService.DeleteUserAsync(userId);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<User>>> GetById(int userId)
        {
            var result = await _userService.GetByIdAsync(userId);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }

        [HttpGet("{email}")]
        public async Task<ActionResult<ApiResponse<User>>> GetByEmai(string email)
        {
            var result = await _userService.GetByEmailAsync(email);
            if (!result.Success) return NotFound(result);
            return Ok(result);
        }
    }
}
