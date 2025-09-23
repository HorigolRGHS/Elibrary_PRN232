using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace SharedLibrary.Commons
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                int code = 500;
                if (ex is BusinessException be)
                {
                    code = be.StatusCode;
                }

                context.Response.StatusCode = code;
                context.Response.ContentType = "application/json";

                var response = new { success = false, error = ex.Message, code };
                await context.Response.WriteAsync(JsonSerializer.Serialize(response));
            }
        }
    }
}
