import Header from "@/components/Header";
import { Task, useGetTasksQuery } from "@/state/api";
import TaskCard from "@/components/card/TaskCard";
import React from "react";
import { CircularProgress } from "@mui/material";
import MoreInfo from "@/components/MoreInfo";

// TODO: Props can be reused from the different views
type TileViewProps = {
  id: string;
  isArchivedSelected: boolean;
  taskSearchQuery: string;
};

const TileView = ({
  id,
  isArchivedSelected,
  taskSearchQuery,
}: TileViewProps) => {
  const {
    data: tasks,
    isLoading,
    error,
  } = useGetTasksQuery({
    projectId: Number(id),
    isArchived: isArchivedSelected,
    query: taskSearchQuery,
  });

  // TODO: Create reusable component for this
  if (isLoading)
    return (
      <div>
        <CircularProgress sx={{ margin: "20px" }} />
      </div>
    );
  if (error) return <div>An error occurred while retrieving tasks</div>;

  return (
    <div className="px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header
          title="Tile"
          rightAlignedComponent={
            <MoreInfo
              title={
                <div className="grid gap-2">
                  <div className="text-center">
                    <b>Tile View Info:</b>
                  </div>
                  <div>
                    Tile View displays tasks in a grid structure. Each tiled
                    task displays title, ID, status, user infomation, and other details.
                  </div>
                </div>
              }
            />
          }
          isSmallText
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {tasks?.map((task: Task) => <TaskCard key={task.id} task={task} />)}
      </div>
    </div>
  );
};

export default TileView;
