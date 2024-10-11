import React, { useState } from "react";
import {
  Comment,
  useCreateCommentMutation,
  useSoftDeleteCommentMutation,
} from "@/state/api";
import {
  IconEdit,
  IconMessage,
  IconPencilOff,
  IconRotateClockwise,
  IconSend2,
  IconTrash,
} from "@tabler/icons-react";
import Image from "next/image";
import { formatISO } from "date-fns";
import { formInputStyles } from "@/lib/utils";

type CommentListProps = {
  comments?: Comment[];
  numberOfComments: number;
  taskId: number;
};

const CommentList = ({
  comments,
  numberOfComments,
  taskId,
}: CommentListProps) => {
  const [createComment, { isLoading: isLoadingCreateComment }] =
    useCreateCommentMutation();
  const [
    softDeleteRecoverComment,
    { isLoading: isLoadingSoftDeleteRecoverComment },
  ] = useSoftDeleteCommentMutation();

  const userId = 1; // TODO: AUTHENTIFICATION - make this the authentificated user
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleSubmitComment = async () => {
    const formattedPostedDate = formatISO(new Date(), {
      representation: "complete",
    });

    await createComment({
      taskId,
      partialComment: {
        text: commentText,
        postedDate: formattedPostedDate,
        userId, // TODO: AUTHENTIFICATION - make this the authentificated user
      },
    });
    setIsAddingComment(false)
  };

  const handleSoftDeleteRecoverComment = async (
    commentId: number,
    commentDeletedAt?: string,
  ) => {
    // Recover
    let formattedSoftDeleteDate = undefined; // TODO: Ensure these are undefined
    let deletedByUserId;
    // Otherwise soft delete comment
    if (!commentDeletedAt) {
      formattedSoftDeleteDate = formatISO(new Date(), {
        representation: "complete",
      });
      deletedByUserId = userId; // TODO: AUTHENTIFICATION - make this the authentificated user
    }

    await softDeleteRecoverComment({
      taskId,
      commentId: commentId,
      partialComment: {
        deletedAt: formattedSoftDeleteDate,
        deletedByUserId: deletedByUserId, // TODO: AUTHENTIFICATION - make this the authentificated user
      },
    });
  };

  function addComment() {
    setIsAddingComment(false);
    resetCommentText();
    // TODO: Add comment functionality - may need task id
  }

  function resetCommentText() {
    setCommentText("");
  }

  function invalidateSubmit() {
    return isLoadingCreateComment || isLoadingSoftDeleteRecoverComment;
  }

  const unSortedComments = !comments ? undefined : [...comments];

  return (
    <div>
      <div className="mb-3 flex items-center justify-center text-gray-500 dark:text-neutral-500">
        <IconMessage size={20} />
        <span className="ml-1 text-sm dark:text-neutral-400">
          Comments: {numberOfComments}
        </span>
      </div>
      {unSortedComments
        ?.sort((commentA, commentB) =>
          commentA.postedDate && commentB.postedDate && commentA.postedDate > commentB.postedDate ? 1 : -1,
        )
        .map((comment: Comment) => (
          <div
            className={`flex ${comment.userId === userId ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`mb-4 w-[90%] rounded-md p-5 shadow ${comment.userId === userId ? "bg-blue-200 dark:bg-blue-800" : "bg-white dark:bg-dark-secondary"}`}
            >
              <span className="text-sm dark:text-neutral-400">
                {comment.deletedAt ? (
                  <div className="pb-2">
                    <i>
                      Comment Deleted at: {comment.deletedAt}{" "}
                      {comment.deletedBy &&
                        `by: ${comment.deletedBy?.username}`}
                    </i>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Image
                        key={comment.user?.userId}
                        // TODO: Ensure profile picture exists
                        // TODO: Maybe have some extra validation here and have placeholder image
                        src={`/${comment.user?.profilePictureUrl!}`}
                        alt={comment.user?.username || ""}
                        width={30}
                        height={30}
                        className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
                      />
                      <div>
                        {comment.user?.username} at {comment.postedDate}{" "}
                        {comment.latestEditDate &&
                          `(Latest edit: ${comment.latestEditDate})`}
                      </div>
                    </div>
                    <div className="py-3">{comment.text}</div>
                  </>
                )}
              </span>
              <button
                className={`flex items-center rounded bg-red-500 px-3 py-2 text-white hover:bg-red-600 ${invalidateSubmit() ? "cursor-not-allowed opacity-50" : ""}`}
                disabled={invalidateSubmit()}
                onClick={() =>
                  handleSoftDeleteRecoverComment(comment.id, comment.deletedAt)
                }
              >
                {comment.deletedAt ? (
                  <>
                    <IconRotateClockwise className="mr-2 h-5 w-5" />
                    Recover Comment
                  </>
                ) : (
                  <>
                    <IconTrash className="mr-2 h-5 w-5" />
                    Delete Comment
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      {/* TODO: Common component for icon with button? */}
      {!isAddingComment ? (
        <div className="flex justify-center">
          <button
            className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
            onClick={() => setIsAddingComment(true)}
          >
            <IconEdit className="mr-2 h-5 w-5" />
            Add Comment
          </button>
        </div>
      ) : (
        <div className="mb-4 w-[90%] rounded-md bg-blue-200 p-5 shadow dark:bg-blue-800">
          <span className="text-sm dark:text-neutral-400">
            <div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  addComment();
                }}
              >
                <textarea
                  className={formInputStyles}
                  placeholder="Comment Message"
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    className="flex items-center rounded bg-gray-600 px-3 py-2 text-white hover:bg-gray-700"
                    onClick={() => {
                      setIsAddingComment(false);
                      resetCommentText();
                    }}
                  >
                    <IconPencilOff className="mr-2 h-5 w-5" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600 ${invalidateSubmit() ? "cursor-not-allowed opacity-50" : ""}`}
                    disabled={invalidateSubmit()}
                    onClick={() => {
                      handleSubmitComment();
                      resetCommentText();
                    }}
                  >
                    <IconSend2 className="mr-2 h-5 w-5" />
                    Submit Comment
                  </button>
                </div>
              </form>
            </div>
          </span>
        </div>
      )}
    </div>
  );
};

export default CommentList;
