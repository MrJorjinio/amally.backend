using Amally.Application.DTOs.Comments;
using Amally.Application.DTOs.Users;
using Amally.Application.Interfaces;
using Amally.Core.Entities;
using Amally.Core.Interfaces;

namespace Amally.Application.Services;

public class CommentService : ICommentService
{
    private readonly ICommentRepository _commentRepo;
    private readonly ICommentLikeRepository _commentLikeRepo;
    private readonly IPostRepository _postRepo;

    public CommentService(ICommentRepository commentRepo, ICommentLikeRepository commentLikeRepo, IPostRepository postRepo)
    {
        _commentRepo = commentRepo;
        _commentLikeRepo = commentLikeRepo;
        _postRepo = postRepo;
    }

    public async Task<List<CommentDto>> GetByPostIdAsync(Guid postId, Guid? currentUserId)
    {
        var comments = await _commentRepo.GetByPostIdAsync(postId);
        var rootComments = comments.Where(c => c.ParentCommentId == null).ToList();
        return rootComments.Select(c => MapToDto(c, currentUserId)).ToList();
    }

    public async Task<CommentDto> CreateAsync(Guid userId, Guid postId, CreateCommentRequest request)
    {
        var post = await _postRepo.GetByIdAsync(postId)
            ?? throw new KeyNotFoundException("Post not found.");

        if (request.ParentCommentId.HasValue)
        {
            var parent = await _commentRepo.GetByIdAsync(request.ParentCommentId.Value)
                ?? throw new KeyNotFoundException("Parent comment not found.");
            if (parent.PostId != postId)
                throw new InvalidOperationException("Parent comment belongs to a different post.");
        }

        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            Content = request.Content,
            UserId = userId,
            PostId = postId,
            ParentCommentId = request.ParentCommentId,
            CreatedAt = DateTime.UtcNow
        };

        await _commentRepo.CreateAsync(comment);

        post.CommentsCount++;
        await _postRepo.UpdateAsync(post);

        var created = await _commentRepo.GetByIdAsync(comment.Id);
        return MapToDto(created!, null);
    }

    public async Task<CommentDto> UpdateAsync(Guid userId, Guid commentId, string content)
    {
        var comment = await _commentRepo.GetByIdAsync(commentId)
            ?? throw new KeyNotFoundException("Comment not found.");

        if (comment.UserId != userId)
            throw new UnauthorizedAccessException("You can only edit your own comments.");

        comment.Content = content;
        comment.UpdatedAt = DateTime.UtcNow;
        await _commentRepo.UpdateAsync(comment);

        return MapToDto(comment, userId);
    }

    public async Task DeleteAsync(Guid userId, Guid commentId)
    {
        var comment = await _commentRepo.GetByIdAsync(commentId)
            ?? throw new KeyNotFoundException("Comment not found.");

        if (comment.UserId != userId)
            throw new UnauthorizedAccessException("You can only delete your own comments.");

        var post = await _postRepo.GetByIdAsync(comment.PostId);
        if (post is not null)
        {
            post.CommentsCount = Math.Max(0, post.CommentsCount - 1);
            await _postRepo.UpdateAsync(post);
        }

        await _commentRepo.DeleteAsync(comment);
    }

    public async Task<bool> ToggleLikeAsync(Guid userId, Guid commentId)
    {
        var comment = await _commentRepo.GetByIdAsync(commentId)
            ?? throw new KeyNotFoundException("Comment not found.");

        if (await _commentLikeRepo.ExistsAsync(userId, commentId))
        {
            await _commentLikeRepo.DeleteAsync(userId, commentId);
            comment.LikesCount = Math.Max(0, comment.LikesCount - 1);
            await _commentRepo.UpdateAsync(comment);
            return false;
        }

        await _commentLikeRepo.CreateAsync(new CommentLike { UserId = userId, CommentId = commentId, CreatedAt = DateTime.UtcNow });
        comment.LikesCount++;
        await _commentRepo.UpdateAsync(comment);
        return true;
    }

    private CommentDto MapToDto(Comment comment, Guid? currentUserId)
    {
        return new CommentDto
        {
            Id = comment.Id,
            Content = comment.Content,
            Author = new UserSummaryDto
            {
                Id = comment.User.Id,
                Username = comment.User.Username,
                FullName = comment.User.FullName,
                ProfilePictureUrl = comment.User.ProfilePictureUrl
            },
            ParentCommentId = comment.ParentCommentId,
            LikesCount = comment.LikesCount,
            IsLiked = false,
            Replies = comment.Replies?.Select(r => MapToDto(r, currentUserId)).ToList() ?? [],
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt
        };
    }
}
