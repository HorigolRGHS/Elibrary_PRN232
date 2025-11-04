using Elib.Catalog.Service.DTOs;
using Elib.Catalog.Service.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Commons;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.OData.Query;
using Elib.Catalog.Service.Models;
using System.Linq;

namespace Elib.Catalog.Service.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubjectsController : ControllerBase
    {
        private readonly ISubjectService _subjectService;

        public SubjectsController(ISubjectService subjectService)
        {
            _subjectService = subjectService;
        }

        // GET: api/Subjects
        [AllowAnonymous]
        [EnableQuery]
        [HttpGet]
        public ActionResult<IQueryable<SubjectReadDTO>> GetSubjects()
        {
            var query = _subjectService.GetAllQueryable();
            return Ok(query);
        }

        // GET: api/Subjects/5
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<SubjectReadDTO>>> GetSubject(int id)
        {
            var response = await _subjectService.GetByIdAsync(id);
            if (response.Success)
            {
                if (response.Data == null)
                    return NotFound(response);

                return Ok(response);
            }

            return NotFound(response);
        }

        // POST: api/Subjects
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<ApiResponse<SubjectReadDTO>>> CreateSubject(SubjectCreateDTO subjectDto)
        {
            var response = await _subjectService.CreateAsync(subjectDto);
            if (response.Success)
            {
                return CreatedAtAction(nameof(GetSubject), new { id = response.Data?.SubjectId }, response);
            }
            return StatusCode(StatusCodes.Status500InternalServerError, response);
        }

        // PUT: api/Subjects/5
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<SubjectReadDTO>>> UpdateSubject(int id, SubjectUpdateDTO subjectDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<SubjectReadDTO>.Fail("Invalid model state"));
            }

            var response = await _subjectService.UpdateAsync(id, subjectDto);
            if (response.Success)
            {
                return Ok(response);
            }

            if (response.Message == "Subject not found")
            {
                return NotFound(response);
            }
            return StatusCode(StatusCodes.Status500InternalServerError, response);
        }

        // DELETE: api/Subjects/5
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteSubject(int id)
        {
            var response = await _subjectService.DeleteAsync(id);
            if (response.Success)
            {
                return Ok(response);
            }

            if (response.Message == "Subject not found")
            {
                return NotFound(response);
            }
            return StatusCode(StatusCodes.Status500InternalServerError, response);
        }
    }
}