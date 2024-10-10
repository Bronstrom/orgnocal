"use client";

import React from "react";
import TaskView from "../TaskView";
import { useGetTaskQuery } from "@/state/api";
import { CircularProgress } from "@mui/material";
import CommentList from "../CommentList";

type TaskPageProps = {
  params: { id: string };
};

const TaskPage = ({ params }: TaskPageProps) => {
  // Destructure parameters
  const { id } = params;
  const {
    data: task,
    isLoading,
    isError,
  } = useGetTaskQuery({
    taskId: parseInt(id),
  });

  const numberOfComments: number = task?.comments?.length || 0;

  // TODO: Error out here?
  if (isLoading)
    return (
      <div>
        <CircularProgress sx={{ margin: "20px" }} />
      </div>
    );
  if (isError || !task)
    return <div>An error occurred while retrieving tasks</div>;

  return (
    <div className="p-8">
      {/* Project view tabs */}
      <TaskView key={task.id} task={task} />
      {/* Display comments */}
      <CommentList
        comments={task.comments}
        numberOfComments={numberOfComments}
        taskId={task.id}
      />
    </div>
  );
};

export default TaskPage;
