using AutoMapper;
using Elib.Interaction.Service.DTOs.Comment;
using Elib.Interaction.Service.Models;
using Elib.Interaction.Service.Repositories;
using Microsoft.CodeAnalysis.Editing;
using SharedLibrary.Commons;
using SharedLibrary.Messages;

namespace Elib.Interaction.Service.Services
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _commentRepository;
        private readonly IMapper _mapper;

        public CommentService(ICommentRepository commentRepository, IMapper mapper)
        {
            _commentRepository = commentRepository;
            _mapper = mapper;
        }

        public async Task<ApiResponse<IEnumerable<CommentListDTO>>> GetCommentsByDocumentIdAsync(int documentId)
        {
            var comments = await _commentRepository.GetCommentsByDocumentIdAsync(documentId);
            var listDtos = _mapper.Map<IEnumerable<CommentListDTO>>(comments);

            return ApiResponse<IEnumerable<CommentListDTO>>.Ok(listDtos, "Fetched comments successfully");
        }

        public async Task<ApiResponse<CommentReadDTO>> GetByIdAsync(int id)
        {
            var comment = await _commentRepository.GetByIdAsync(id);
            if (comment == null)
                return ApiResponse<CommentReadDTO>.Fail("Comment not found");

            var dto = _mapper.Map<CommentReadDTO>(comment);
            return ApiResponse<CommentReadDTO>.Ok(dto, "Fetched comment successfully");
        }

        public async Task<ApiResponse<CommentReadDTO>> CreateAsync(CommentCreateDTO dto)
        {
            dto.Content = TextCleaner.CleanSpaces(dto.Content);
            var entity = _mapper.Map<Comment>(dto);

            await _commentRepository.AddAsync(entity);
            await _commentRepository.SaveChangesAsync();

            var result = _mapper.Map<CommentReadDTO>(entity);
            return ApiResponse<CommentReadDTO>.Ok(result, "Comment created successfully");
        }

        public async Task<ApiResponse<CommentReadDTO>> UpdateAsync(int id, CommentUpdateDTO dto)
        {
            var existing = await _commentRepository.GetByIdAsync(id);
            if (existing == null)
                return ApiResponse<CommentReadDTO>.Fail("Comment not found");

            dto.Content = TextCleaner.CleanSpaces(dto.Content);
            _mapper.Map(dto, existing);

            await _commentRepository.UpdateAsync(existing);
            await _commentRepository.SaveChangesAsync();

            var result = _mapper.Map<CommentReadDTO>(existing);
            return ApiResponse<CommentReadDTO>.Ok(result, "Comment updated successfully");
        }


        public async Task<ApiResponse<bool>> DeleteAsync(int id)
        {
            var comment = await _commentRepository.GetByIdAsync(id);
            if (comment == null)
                return ApiResponse<bool>.Fail("Comment not found");

            await _commentRepository.DeleteAsync(comment);
            await _commentRepository.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Comment deleted successfully");
        }

    }
}
