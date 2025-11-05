"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Send, Edit2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CommentService } from "@/services/Comment/Comment";
import { CommentListDTO } from "@/models/dtos/commentDTO";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";

interface DocumentCommentsProps {
  documentId: number;
}

export function DocumentComments({ documentId }: DocumentCommentsProps) {
  const [comments, setComments] = useState<CommentListDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<{
    id: number;
    content: string;
  } | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const currentUserId = useCurrentUserId();

  useEffect(() => {
    fetchComments();
  }, [documentId]);

  const fetchComments = async () => {
    try {
      const data = await CommentService.getDocumentComments(documentId);
      setComments(data);
    } catch (error) {
      toast.error("Failed to load comments");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
console.log("DocumentComments render:", { documentId, comments });

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUserId) return;
    
    setSubmitting(true);
    try {
      await CommentService.createComment({
        documentId,
        content: newComment.trim(),
        createdBy: currentUserId,
      });
      setNewComment("");
      await fetchComments();
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };
  

  const handleUpdateComment = async () => {
    if (!editingComment) return;
    
    setSubmitting(true);
    try {
      await CommentService.updateComment(editingComment.id, {
        content: editingComment.content.trim(),
      });
      setEditingComment(null);
      await fetchComments();
      toast.success("Comment updated successfully");
    } catch (error) {
      toast.error("Failed to update comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!deletingCommentId) return;
    
    setSubmitting(true);
    try {
      await CommentService.deleteComment(deletingCommentId);
      setDeletingCommentId(null);
      await fetchComments();
      toast.success("Comment deleted successfully");
    } catch (error) {
      toast.error("Failed to delete comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment */}
        {currentUserId ? (
        <div className="flex gap-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleSubmitComment}
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Please log in to add comments.
          </p>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.commentId}
                className="flex gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1">
                  {editingComment?.id === comment.commentId ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingComment.content}
                        onChange={(e) =>
                          setEditingComment({
                            ...editingComment,
                            content: e.target.value,
                          })
                        }
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleUpdateComment}
                          disabled={submitting}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingComment(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium">
                        {comment.createdByFullName}
                      </p>
                      <p className="mt-1">{comment.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(comment.createdDate).toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
                {currentUserId === comment.createdBy && (
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setEditingComment({
                          id: comment.commentId,
                          content: comment.content,
                        })
                      }
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => setDeletingCommentId(comment.commentId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Delete Comment Dialog */}
        <AlertDialog
          open={!!deletingCommentId}
          onOpenChange={() => setDeletingCommentId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Comment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this comment? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteComment}
                disabled={submitting}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}