"use client";

import { useState } from "react";
import {
  validateUpdateCommentData,
  ValidationError,
} from "@/app/utils/validation";
import { ApiResponse } from "@/app/utils/response";
import { createCommentAction } from "@/app/actions/comments/createCommentAction";
import { updateCommentAction } from "@/app/actions/comments/updateCommentAction";
import { deleteCommentAction } from "@/app/actions/comments/deleteCommentAction";

export type UserPayload = {
  userId: string;
  name: string;
};

type Comment = {
  id: string;
  author: { name: string; id: string };
  content: string;
  createdAt?: string | number;
};

type CommentsProps = {
  initialComments: Comment[];
  taskId: string;
  projectId: string;
  currentUser?: UserPayload;
  onNewComment?: (comment: Comment) => void;
};

export default function Comments({
  initialComments,
  taskId,
  projectId,
  currentUser,
  onNewComment,
}: CommentsProps) {
  console.log("🟦 currentUser reçu :", currentUser);

  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");

  const formatDate = (date?: string | number) => {
    if (!date) return "";
    const d = typeof date === "number" ? new Date(date) : new Date(date);
    const day = d.getDate();
    const month = d.toLocaleString("fr-FR", { month: "short" });
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${hours}:${minutes}`;
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser) return;

    try {
      const result: ApiResponse<{ comment: Comment }> =
        await createCommentAction(projectId, taskId, newComment.trim());

      if (result.success && result.data?.comment) {
        setComments((prev) => [...prev, result.data!.comment]);
        setNewComment("");
        onNewComment?.(result.data.comment);
      }
    } catch (err) {
      console.error("Erreur création commentaire :", err);
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    if (!currentUser) return console.error("Utilisateur non défini");

    const errors: ValidationError[] = validateUpdateCommentData({ content });
    if (errors.length) return console.error("Validation failed:", errors);

    try {
      const result: ApiResponse<{ comment: Comment }> =
        await updateCommentAction(commentId, content);

      if (result.success && result.data?.comment) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? result.data!.comment : c))
        );
      }
    } catch (err) {
      console.error("Erreur update comment:", err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser) return console.error("Utilisateur non défini");

    try {
      const result: ApiResponse = await deleteCommentAction(commentId);
      if (result.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (err) {
      console.error("Erreur delete comment:", err);
    }
  };

  return (
    <div className="mt-2 flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {comments.map((comment) => (
          <li key={comment.id} className="flex gap-2 items-start text-gray-700">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gray-200">
              <span className="text-sm font-medium text-black">
                {getInitials(comment.author.name)}
              </span>
            </div>

            <div className="flex-1 bg-gray-100 rounded-xl p-2 border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">
                  {comment.author.name}
                </span>

                {comment.author.id === currentUser?.userId && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const updatedContent = prompt(
                          "Modifier le commentaire :",
                          comment.content
                        );
                        if (updatedContent)
                          handleUpdateComment(comment.id, updatedContent);
                      }}
                      className="text-blue-500 text-xs ml-2"
                    >
                      Modifier
                    </button>

                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-500 text-xs ml-1"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
              <span className="text-[6px] text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Ajouter un commentaire */}
      <div className="mt-3 bg-[#F7F7F7] p-3 rounded-xl border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#FFE8D9]">
            <span className="text-sm font-medium text-black">
              {getInitials(currentUser?.name)}
            </span>
          </div>

          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={2}
              disabled={!currentUser}
            />

            <div className="flex justify-end mt-2">
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || !currentUser}
                className="text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed px-4 py-1.5 text-sm rounded-lg transition-all"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
