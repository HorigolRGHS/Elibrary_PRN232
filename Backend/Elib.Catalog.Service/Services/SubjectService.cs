using AutoMapper;
using Elib.Catalog.Service.Models;
using Elib.Catalog.Service.Repositories;
using SharedLibrary.Commons;
using SharedLibrary.Services;
using Elib.Catalog.Service.DTOs;

namespace Elib.Catalog.Service.Services
{
    public class SubjectService : ISubjectService
    {
        private readonly ISubjectRepository _repo;
        private readonly IMapper _mapper;

        public SubjectService(ISubjectRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<ApiResponse<SubjectReadDTO>> CreateAsync(SubjectCreateDTO entityDto)
        {
            var subject = _mapper.Map<Subject>(entityDto);


            await _repo.AddAsync(subject);
            await _repo.SaveChangesAsync();

            var readDto = _mapper.Map<SubjectReadDTO>(subject);
            return ApiResponse<SubjectReadDTO>.Ok(readDto);
        }

        public async Task<ApiResponse<bool>> DeleteAsync(int id)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null)
                return ApiResponse<bool>.Fail("Subject not found");

            await _repo.DeleteAsync(existing);
            await _repo.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true);
        }

        public async Task<ApiResponse<IEnumerable<SubjectReadDTO>>> GetAllAsync()
        {
            var items = await _repo.GetAllAsync();
            var readDtos = _mapper.Map<IEnumerable<SubjectReadDTO>>(items);
            return ApiResponse<IEnumerable<SubjectReadDTO>>.Ok(readDtos);
        }

        public async Task<ApiResponse<SubjectReadDTO>> GetByIdAsync(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null) return ApiResponse<SubjectReadDTO>.Fail("Subject not found");

            var readDto = _mapper.Map<SubjectReadDTO>(item);
            return ApiResponse<SubjectReadDTO>.Ok(readDto);
        }

        public async Task<ApiResponse<SubjectReadDTO>> UpdateAsync(int id, SubjectUpdateDTO entityDto)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null)
                return ApiResponse<SubjectReadDTO>.Fail("Subject not found");

            _mapper.Map(entityDto, existing);

            await _repo.UpdateAsync(existing);
            await _repo.SaveChangesAsync();

            var readDto = _mapper.Map<SubjectReadDTO>(existing);
            return ApiResponse<SubjectReadDTO>.Ok(readDto);
        }
    }
}