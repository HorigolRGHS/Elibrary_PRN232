using Elib.Auth.Service.Repositories;
using SharedLibrary.Messages;
using Microsoft.EntityFrameworkCore;
using MassTransit;

namespace Elib.Auth.Service.Consumers
{
    public class UserFullNamesRequestConsumer : IConsumer<UserFullNamesRequest>
    {
        private readonly IUserRepository _userRepo;

        public UserFullNamesRequestConsumer(IUserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        public async Task Consume(ConsumeContext<UserFullNamesRequest> context)
        {
            var userIds = context.Message.UserIds;
            
            if (userIds == null || !userIds.Any())
            {
                await context.RespondAsync(new UserFullNamesResponse(
                    context.Message.RequestId,
                    new Dictionary<int, string>()
                ));
                return;
            }

            // Query users by IDs and get their full names
            var users = await _userRepo.AsQueryable()
                .Where(u => userIds.Contains(u.UserId))
                .Select(u => new { u.UserId, u.FullName })
                .ToListAsync();

            // Create a dictionary mapping userId -> fullName
            var userFullNames = users.ToDictionary(u => u.UserId, u => u.FullName);

            await context.RespondAsync(new UserFullNamesResponse(
                context.Message.RequestId,
                userFullNames
            ));
        }
    }
}
