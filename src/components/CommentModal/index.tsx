import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addCommentToPost, getCommentsByPostId } from "@/repository/comment.service";
import { useUserAuth } from "@/context/userAuthContext";

interface CommentModalProps {
  postId: string;
  onClose: () => void;
}

const CommentModal: React.FunctionComponent<CommentModalProps> = ({ postId, onClose }) => {
  const { user } = useUserAuth();
  const [comments, setComments] = useState<
    { username: string; comment: string; photoURL?: string }[]
  >([]);
  const [newComment, setNewComment] = useState<string>("");

  const fetchComments = async () => {
    const fetchedComments = await getCommentsByPostId(postId);
    setComments(fetchedComments || []);
  };

  const handleAddComment = async () => {
    if (newComment.trim() && user) {
      try {
        await addCommentToPost(
          postId,
          user.uid,
          user.displayName || "Anonymous",
          user.photoURL || "/default-avatar.png",
          newComment
        );
        setNewComment("");
        fetchComments(); // Recharge les commentaires
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Comments</h3>
        <div className="mb-4 max-h-64 overflow-y-auto">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="p-2 border-b text-sm flex items-center gap-2">
                <img
                  src={comment.photoURL || "/default-avatar.png"}
                  alt={comment.username}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <strong>{comment.username}:</strong> {comment.comment}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500">No comments yet.</div>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-grow"
          />
          <Button onClick={handleAddComment} className="flex-none">
            Post
          </Button>
        </div>
        <Button onClick={onClose} className="mt-4 w-full">
          Close
        </Button>
      </div>
    </div>
  );
};

export default CommentModal;