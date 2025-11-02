using Elib.Catalog.Service.DTOs;
using Elib.Catalog.Service.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.OData.Query;

namespace Elib.Catalog.Service.Controllers
{
    public class EnrichDocumentUserNamesFilter : IAsyncResultFilter
    {
        private readonly IDocumentService _documentService;

        public EnrichDocumentUserNamesFilter(IDocumentService documentService)
        {
            _documentService = documentService;
        }

        public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
        {
            if (context.Result is ObjectResult objectResult && objectResult.Value != null)
            {
                var resultType = objectResult.Value.GetType();
                
                if (objectResult.Value is IQueryable<AdminDocumentListDTO> queryable)
                {
                    var documents = queryable.ToList();
                    await _documentService.EnrichDocumentsWithUserNames(documents);
                    objectResult.Value = documents;
                }
                else if (objectResult.Value is IEnumerable<AdminDocumentListDTO> enumerable)
                {
                    var documents = enumerable.ToList();
                    await _documentService.EnrichDocumentsWithUserNames(documents);
                    objectResult.Value = documents;
                }
            }

            await next();
        }
    }
}
