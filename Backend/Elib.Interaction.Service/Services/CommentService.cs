using AutoMapper;
using Elib.Interaction.Service.DTOs.Comment;
using Elib.Interaction.Service.Models;
using Elib.Interaction.Service.Repositories;
using Microsoft.CodeAnalysis.Editing;
using SharedLibrary.Commons;
using SharedLibrary.Messages;
using MassTransit;
using System.Net.Http;
using System.Text.Json;

namespace Elib.Interaction.Service.Services
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _commentRepository;
        private readonly IMapper _mapper;
        private readonly IRequestClient<UserFullNamesRequest> _userNamesClient;
        private readonly IHttpClientFactory _httpFactory;

        public CommentService(ICommentRepository commentRepository, IMapper mapper, IRequestClient<UserFullNamesRequest> userNamesClient, IHttpClientFactory httpFactory)
        {
            _commentRepository = commentRepository;
            _mapper = mapper;
            _userNamesClient = userNamesClient;
            _httpFactory = httpFactory;
        }

        public async Task<ApiResponse<IEnumerable<CommentListDTO>>> GetCommentsByDocumentIdAsync(int documentId)
        {
            var comments = await _commentRepository.GetCommentsByDocumentIdAsync(documentId);
            var listDtos = _mapper.Map<IEnumerable<CommentListDTO>>(comments).ToList();

            var userIds = listDtos.Where(d => d.CreatedBy.HasValue).Select(d => d.CreatedBy!.Value).Distinct().ToList();
            Dictionary<int, string> map = new();

            if (userIds.Any())
            {
                // Try MassTransit request first
                try
                {
                    var req = new UserFullNamesRequest(Guid.NewGuid(), userIds);
                    var resp = await _userNamesClient.GetResponse<UserFullNamesResponse>(req);
                    if (resp?.Message?.UserFullNames is not null)
                        map = resp.Message.UserFullNames;
                }
                catch
                {
                    // ignore and fallback to HTTP
                }

                // Fallback to HTTP for any missing ids
                var missing = userIds.Where(id => !map.ContainsKey(id)).ToList();
                if (missing.Any())
                {
                    try
                    {
                        var httpMap = await GetUserFullNamesByHttpAsync(missing);
                        foreach (var kv in httpMap)
                            map[kv.Key] = kv.Value;
                    }
                    catch
                    {
                        // ignore
                    }
                }

                // Assign full names
                foreach (var dto in listDtos)
                {
                    if (dto.CreatedBy.HasValue && map.TryGetValue(dto.CreatedBy.Value, out var fullName))
                        dto.CreatedByFullName = fullName;
                }
            }

            return ApiResponse<IEnumerable<CommentListDTO>>.Ok(listDtos, "Fetched comments successfully");
        }

        public async Task<ApiResponse<CommentReadDTO>> GetByIdAsync(int id)
        {
            var comment = await _commentRepository.GetByIdAsync(id);
            if (comment == null)
                return ApiResponse<CommentReadDTO>.Fail("Comment not found");

            var dto = _mapper.Map<CommentReadDTO>(comment);

            if (dto.CreatedBy.HasValue)
            {
                string? name = null;
                try
                {
                    var req = new UserFullNamesRequest(Guid.NewGuid(), new List<int> { dto.CreatedBy.Value });
                    var resp = await _userNamesClient.GetResponse<UserFullNamesResponse>(req);
                    if (resp?.Message?.UserFullNames != null)
                        resp.Message.UserFullNames.TryGetValue(dto.CreatedBy.Value, out name);
                }
                catch
                {
                    // ignore
                }

                if (string.IsNullOrEmpty(name))
                {
                    try
                    {
                        var httpMap = await GetUserFullNamesByHttpAsync(new List<int> { dto.CreatedBy.Value });
                        httpMap.TryGetValue(dto.CreatedBy.Value, out name);
                    }
                    catch
                    {
                        // ignore
                    }
                }

                dto.CreatedByFullName = name;
            }

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

        private async Task<Dictionary<int, string>> GetUserFullNamesByHttpAsync(IEnumerable<int> ids)
        {
            var result = new Dictionary<int, string>();
            var client = _httpFactory.CreateClient("AuthService");

            var tasks = ids.Select(async id =>
            {
                try
                {
                    var resp = await client.GetAsync($"api/users/{id}");
                    if (!resp.IsSuccessStatusCode) return;

                    var json = await resp.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(json);
                    if (doc.RootElement.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Object)
                    {
                        if (data.TryGetProperty("fullName", out var fullNameProp))
                        {
                            var fn = fullNameProp.GetString();
                            if (!string.IsNullOrEmpty(fn)) result[id] = fn;
                        }
                        else if (data.TryGetProperty("FullName", out var fullNameProp2))
                        {
                            var fn2 = fullNameProp2.GetString();
                            if (!string.IsNullOrEmpty(fn2)) result[id] = fn2;
                        }
                    }
                }
                catch
                {
                    // ignore per-id failures
                }
            });

            await Task.WhenAll(tasks);
            return result;
        }
    }
}
