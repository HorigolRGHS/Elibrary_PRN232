using Elib.Catalog.Service.Data;
using Elib.Catalog.Service.DTOs;
using Elib.Catalog.Service.Models;
using Elib.Catalog.Service.Services;
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


namespace Elib.Catalog.Service.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ODataController
    {
        private readonly ICategoryService _service;

        public CategoriesController(ICategoryService service) => _service = service;

        // GET /Categories?$filter=contains(CategoryName,'prog')&$select=CategoryId,CategoryName&$orderby=CreatedDate desc&$top=10&$count=true
        [EnableQuery(PageSize = 50)]
        [AllowAnonymous]
        [HttpGet]
        public IQueryable<CategoryReadDTO> Get() => _service.QueryDto();

        // GET api/Categories/5
        [EnableQuery]
        [AllowAnonymous]
        [HttpGet("({key})")]
        public async Task<IActionResult> Get([FromRoute] int key)
        {
            var dto = await _service.GetByIdAsync(key);
            return dto is null ? NotFound() : Ok(dto);
        }

        // POST api/Categories
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CategoryCreateDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var created = await _service.CreateAsync(dto);
            return Created(created);
        }

        // PUT api/Categories/5
        [Authorize(Roles = "Admin")]
        [HttpPut("({key})")]
        public async Task<IActionResult> Put([FromRoute] int key, [FromBody] CategoryUpdateDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var ok = await _service.UpdateAsync(key, dto);
            return ok ? NoContent() : NotFound();
        }

        // DELETE api/Categories/5
        [Authorize(Roles = "Admin")]
        [HttpDelete("({key})")]
        public async Task<IActionResult> Delete([FromRoute] int key)
        {
            var ok = await _service.DeleteAsync(key);
            return ok ? NoContent() : NotFound();
        }
    }
}