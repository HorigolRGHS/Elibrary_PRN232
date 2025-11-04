using Elib.Interaction.Service.Data;
using Elib.Interaction.Service.DTOs;
using Elib.Interaction.Service.Models;
using Elib.Interaction.Service.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Elib.Interaction.Service.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RatingsController : ODataController
    {
        private readonly IRatingService _service;
        public RatingsController(IRatingService service) => _service = service;

        // GET /Ratings?$filter=DocumentId eq 42&$orderby=CreatedDate desc&$count=true
        [EnableQuery(PageSize = 50)]
        [AllowAnonymous]
        [HttpGet]
        public IQueryable<RatingReadDTO> Get() => _service.QueryDto();

        // GET /Ratings(5)
        [EnableQuery]
        [AllowAnonymous]
        [HttpGet("({key})")]
        public async Task<IActionResult> Get([FromRoute] int key)
        {
            var dto = await _service.GetByIdAsync(key);
            return dto is null ? NotFound() : Ok(dto);
        }

        // POST /Ratings
        [Authorize(Roles = "Customer")]
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] RatingCreateDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(
                nameof(Get),
                new { key = created.RatingId },
                created
                );
        }

        // PUT /Ratings(5)
        [Authorize(Roles = "Customer")]
        [HttpPut("({key})")]
        public async Task<IActionResult> Put([FromRoute] int key, [FromBody] RatingUpdateDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var ok = await _service.UpdateAsync(key, dto);
            return ok ? NoContent() : NotFound();
        }

        // DELETE /Ratings(5)
        [Authorize(Roles = "Customer")]
        [HttpDelete("({key})")]
        public async Task<IActionResult> Delete([FromRoute] int key)
        {
            var ok = await _service.DeleteAsync(key);
            return ok ? NoContent() : NotFound();
        }
    }
}
