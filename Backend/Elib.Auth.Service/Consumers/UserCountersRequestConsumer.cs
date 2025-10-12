using Elib.Auth.Service.Repositories;
using SharedLibrary.Messages;
using Microsoft.EntityFrameworkCore;
using MassTransit;


namespace Elib.Auth.Service.Consumers
{
    public class UserCountersRequestConsumer : IConsumer<UserCountersRequest>
    {
        private readonly IUserRepository _userRepo;

        public UserCountersRequestConsumer(IUserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        public async Task Consume(ConsumeContext<UserCountersRequest> context)
        {
        
            var query = _userRepo.AsQueryable(); 
            var total = await query.CountAsync();
            var active = await query.Where(u => u.Active).CountAsync();

            await context.RespondAsync(new UserCountersResponse(
                context.Message.RequestId,
                TotalUsers: total,
                ActiveUsers: active
            ));
        }
    }
}