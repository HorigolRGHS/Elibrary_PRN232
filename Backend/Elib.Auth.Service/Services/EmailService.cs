using Elib.Auth.Service.Models;
using Microsoft.Extensions.Options;
using MimeKit;
using MailKit.Net.Smtp;

namespace Elib.Auth.Service.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _mailSettings;

        public EmailService(IOptions<EmailSettings> mailSettings)
        {
            _mailSettings = mailSettings.Value;
        }
        //public async Task SendEmailAsync(string toEmail, string subject, string message)
        //{
        //    var emailMessage = new MimeMessage();
        //    emailMessage.From.Add(new MailboxAddress(_configuration["SmtpSettings:SenderName"], _configuration["SmtpSettings:SenderEmail"]));
        //    emailMessage.To.Add(new MailboxAddress("", toEmail));
        //    emailMessage.Subject = subject;
        //    emailMessage.Body = new TextPart("plain") { Text = message };
        //    using (var client = new SmtpClient())
        //    {
        //        await client.ConnectAsync(_configuration["SmtpSettings:Server"], int.Parse(_configuration["SmtpSettings:Port"]), MailKit.Security.SecureSocketOptions.StartTls);
        //        await client.AuthenticateAsync(_configuration["SmtpSettings:Username"], _configuration["SmtpSettings:Password"]);
        //        await client.SendAsync(emailMessage);
        //        await client.DisconnectAsync(true);
        //    }
        //}

        public async Task SendEmailAsync(string toEmail, string subject, string message)
        {
            var emailMessage = new MimeMessage();
            emailMessage.From.Add(new MailboxAddress(_mailSettings.SenderName, _mailSettings.SenderEmail));
            emailMessage.To.Add(new MailboxAddress("", toEmail));
            emailMessage.Subject = subject;
            emailMessage.Body = new TextPart("html") { Text = message };
            using (var client = new SmtpClient())
            {
                await client.ConnectAsync(_mailSettings.Server, _mailSettings.Port, MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(_mailSettings.Username, _mailSettings.Password);
                await client.SendAsync(emailMessage);
                await client.DisconnectAsync(true);
            }
        }
    }
}
