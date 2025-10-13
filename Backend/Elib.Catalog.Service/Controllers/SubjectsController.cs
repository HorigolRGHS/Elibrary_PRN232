using Elib.Catalog.Service.DTOs;
using Elib.Catalog.Service.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SharedLibrary.Commons;
using System.Collections.Generic;
using System.Threading.Tasks;

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
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SubjectReadDTO>>> GetSubjects()
        {
            var response = await _subjectService.GetAllAsync();
            if (response.Success)
            {
                return Ok(response.Data);
            }
            return StatusCode(StatusCodes.Status500InternalServerError, response.Message);
        }

        // GET: api/Subjects/5
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult<SubjectReadDTO>> GetSubject(int id)
        {
            var response = await _subjectService.GetByIdAsync(id);
            if (response.Success)
            {
                if (response.Data == null)
                {
                    return NotFound(response.Message);
                }
                return Ok(response.Data);
            }
            return NotFound(response.Message);
        }

        // POST: api/Subjects
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<SubjectReadDTO>> CreateSubject(SubjectCreateDTO subjectDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _subjectService.CreateAsync(subjectDto);
            if (response.Success)
            {
                return CreatedAtAction(nameof(GetSubject), new { id = response.Data?.SubjectId }, response.Data);
            }
            return StatusCode(StatusCodes.Status500InternalServerError, response.Message);
        }

        // PUT: api/Subjects/5
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSubject(int id, SubjectUpdateDTO subjectDto)
        {
            //if (id != subjectDto.id)
            //{
            //    return BadRequest("Subject ID in URL does not match Subject ID in body.");
            //}

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _subjectService.UpdateAsync(id, subjectDto);
            if (response.Success)
            {
                return NoContent();
            }

            if (response.Message == "Subject not found")
            {
                return NotFound(response.Message);
            }
            return StatusCode(StatusCodes.Status500InternalServerError, response.Message);
        }

        // DELETE: api/Subjects/5
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubject(int id)
        {
            var response = await _subjectService.DeleteAsync(id);
            if (response.Success)
            {
                return NoContent();
            }

            if (response.Message == "Subject not found")
            {
                return NotFound(response.Message);
            }
            return StatusCode(StatusCodes.Status500InternalServerError, response.Message);
        }
    }
}