using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Elib.Catalog.Service.Data;
using Elib.Catalog.Service.Models;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Elib.Catalog.Service.Services;
using Elib.Catalog.Service.DTOs;


namespace Elib.Catalog.Service.Controllers
{
    [Route("[controller]")]
    public class CategoriesController : ODataController
    {
        private readonly ICategoryService _service;

        public CategoriesController(ICategoryService service) => _service = service;

        // GET /Categories?$filter=contains(CategoryName,'prog')&$select=CategoryId,CategoryName&$orderby=CreatedDate desc&$top=10&$count=true
        [EnableQuery(PageSize = 50)]
        [HttpGet]
        public IQueryable<CategoryReadDTO> Get() => _service.QueryDto();

        // GET /Categories(5)
        [EnableQuery]
        [HttpGet("({key})")]
        public async Task<IActionResult> Get([FromRoute] int key)
        {
            var dto = await _service.GetByIdAsync(key);
            return dto is null ? NotFound() : Ok(dto);
        }

        // POST /Categories
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CategoryCreateDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var created = await _service.CreateAsync(dto);
            return Created(created);
        }

        // PUT /Categories(5)
        [HttpPut("({key})")]
        public async Task<IActionResult> Put([FromRoute] int key, [FromBody] CategoryUpdateDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var ok = await _service.UpdateAsync(key, dto);
            return ok ? NoContent() : NotFound();
        }

        // DELETE /Categories(5)
        [HttpDelete("({key})")]
        public async Task<IActionResult> Delete([FromRoute] int key)
        {
            var ok = await _service.DeleteAsync(key);
            return ok ? NoContent() : NotFound();
        }
    }
}