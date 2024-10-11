import React, { useEffect, useState } from "react";
import {
  Task,
  TaskLayer,
  useDeleteTaskLayerMutation,
  useGetProjectLayersQuery,
  useGetTasksQuery,
  useUpdateTaskLayerMutation,
} from "@/state/api";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task as TaskType } from "@/state/api";
import {
  IconDoor,
  IconEdit,
  IconDotsVertical,
  IconInfoCircle,
  IconSquareRoundedX,
  IconMessage,
} from "@tabler/icons-react";
import { format } from "date-fns";
import Image from "next/image";
import Header from "@/components/Header";
import ModalCreateEditTaskLayer from "@/components/modal/ModalCreateEditTaskLayer";
import { PriorityTag } from "../BoardView";
import ModalDelete from "@/components/modal/ModalDelete";
import {
  SubMenuButton,
  SubMenuDropdown,
} from "@/components/dropdown/SubMenuDropdown";
import { CircularProgress } from "@mui/material";
import Link from "next/link";

// TODO: Props can be reused from the different views
type HierarchyViewProps = {
  id: string;
  isArchivedSelected: boolean;
  taskSearchQuery: string;
};

// TODO: Use this for front-end layout - create a org of these initially
// TODO: Consider putting tasks in this object
interface HierarchyViewItem {
  topTaskId: number;
  columnIndex: number;
  maxItemsPerLayer: number;
}

function isCardHighlighted(
  query: string,
  isArchived: boolean,
  title: string,
  description: string | undefined,
  taskArchiveStatus?: boolean,
) {
  const lowerCasedQuery = query.toLowerCase().trim();
  const titleDescriptionMatchInQuery =
    title.toLowerCase().includes(lowerCasedQuery) ||
    description?.toLowerCase().includes(lowerCasedQuery);
  const nonArchivedStatus = !isArchived && !taskArchiveStatus;
  const archivedStatus = isArchived && taskArchiveStatus;
  return (nonArchivedStatus || archivedStatus) && titleDescriptionMatchInQuery;
}

const TASK_ITEM_SIZE = 15;
const TASK_ITEM_MARGIN = 0.25;

const HierarchyView = ({
  id,
  isArchivedSelected,
  taskSearchQuery,
}: HierarchyViewProps) => {
  const [deleteLayer, { isLoading: isLoadingDeleteLayer }] =
    useDeleteTaskLayerMutation();
  const {
    data: taskLayers,
    isLoading: isLoadingLayers,
    isError: isErrorLayers,
  } = useGetProjectLayersQuery({ projectId: Number(id) });
  // taskSearchQuery & isArchived is handled differently here and doesn't hide tasks - instead this is used to highlight cards
  const {
    data: tasks,
    isLoading: isLoadingTasks,
    isError: isErrorTasks,
  } = useGetTasksQuery({
    projectId: Number(id),
    isArchived: undefined,
    query: "",
  });
  const [updateTaskLayer, { isLoading: isLoadingTaskLayerUpdates }] =
    useUpdateTaskLayerMutation();
  const [isShowDetails, setIsShowDetails] = useState(true);
  const [isModalLayerOpen, setIsModalLayerOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [editingModalLayerId, setEditingModalLayerId] = useState<number | null>(
    null,
  );
  const [hierarchyInstances, setHierarchyInstances] = useState<
    HierarchyViewItem[]
  >([]);

  useEffect(() => {
    handleHierarchyInstances();
  }, [tasks, taskLayers]);

  useEffect(() => {
    if (editingModalLayerId && !isModalDeleteOpen) {
      setIsModalLayerOpen(true);
    }
  }, [editingModalLayerId, isModalDeleteOpen]);

  // TODO: Stress test this
  function handleHierarchyInstances() {
    // Used to calculate positioning for each hierarchyInstance
    let topItemsIndex = 0;
    // Clear hierarchy
    setHierarchyInstances([]);
    taskLayers?.map((layer) =>
      // Mask only tasks that are the top level tasks
      layer.tasks
        .filter((task) => !task.parentTaskId)
        .map((task) => {
          // Set-up new hierarchy structure
          const topLayerItemCount = 1;
          let maxItemsPerLayer = 0;
          if (task.nestedTasks) {
            const nestedTasksCount = handleHierarchyInstancesNestedTasks(task);
            maxItemsPerLayer =
              topLayerItemCount > nestedTasksCount
                ? topLayerItemCount
                : nestedTasksCount;
          }
          const hierarchyItem: HierarchyViewItem = {
            topTaskId: task.id,
            columnIndex: topItemsIndex,
            maxItemsPerLayer: maxItemsPerLayer,
          };
          setHierarchyInstances(
            (previousHierarchyInstances: HierarchyViewItem[]) => [
              ...previousHierarchyInstances,
              hierarchyItem,
            ],
          );
          topItemsIndex += 1;
        }),
    );
  }

  // TODO: I think this is wrong - not going to work for very split layers - see even if maxItemsPerLayer is needed
  // Helper function for handleHierarchyInstances
  function handleHierarchyInstancesNestedTasks(task: Task): number {
    let layerItemCountIndex = 0;
    let layerItemCount = 0;
    let nestedTaskLayerCount = 0;
    task.nestedTasks &&
      task.nestedTasks.map((nestedTask, index) => {
        layerItemCountIndex += 1;
        // Accumulate all counts from layer below - this will determine size needed for each "column" beneath a task
        if (nestedTask.nestedTasks) {
          nestedTaskLayerCount +=
            handleHierarchyInstancesNestedTasks(nestedTask);
        }
        // Final task in nested layer - determine if need to update maxItemsPerlayer count
        if (task.nestedTasks && task.nestedTasks.length - 1 === index) {
          layerItemCount =
            layerItemCountIndex > nestedTaskLayerCount
              ? layerItemCountIndex
              : nestedTaskLayerCount;
        }
      });
    return layerItemCount;
  }

  const moveTaskToLayer = (
    taskId: number,
    toTaskLayer: number | null,
    toTaskParent: number | null,
  ) => {
    updateTaskLayer({
      taskId,
      taskLayerId: toTaskLayer,
      parentTaskId: toTaskParent,
    });
  };
  const handleDeleteLayer = async () => {
    try {
      await deleteLayer({
        layerId: Number(editingModalLayerId),
      });
      setIsModalDeleteOpen(false);
      setEditingModalLayerId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const defaultLayerTasks = tasks?.filter(
    (task) => task.taskLayerId === null || task.taskLayerId === undefined,
  );

  // TODO: Create reusable component for this
  if (isLoadingLayers || isLoadingTasks)
    return (
      <div>
        <CircularProgress sx={{ margin: "20px" }} />
      </div>
    );
  if (isErrorLayers || isErrorTasks || !taskLayers || !tasks)
    return <div>An error occurred while retrieving tasks</div>;

  return (
    <div>
      <ModalCreateEditTaskLayer
        isOpen={isModalLayerOpen}
        onClose={() => {
          setIsModalLayerOpen(false);
          setEditingModalLayerId(null);
        }}
        editingModalLayerId={editingModalLayerId}
        taskLayers={taskLayers}
        projectId={Number(id)}
      />
      <ModalDelete
        type={"Layer"}
        name={"Current layer"}
        message="Are you sure you want to delete the current layer?"
        isOpen={isModalDeleteOpen}
        // TODO: Add delete action
        confirmAction={handleDeleteLayer}
        onClose={() => {
          setIsModalDeleteOpen(false);
          setEditingModalLayerId(null);
        }}
        isLoading={isLoadingDeleteLayer}
      />
      {/* TODO: For delete (currentLayer && currentLayer.tasks.length > 0) */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-5 xl:px-6">
        <Header
          title="Hierarchy"
          rightAlignedComponent={
            <div className="flex flex-wrap gap-5">
              Disclaimer: You are unable to move tasks with sub-tasks
              (children), please remove sub-tasks first before removing higher
              tasks. A maximum of 5 task layers can be added. You can&apos;t
              delete layers until all items have been moved off of it.
              <button
                className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
                onClick={() => setIsShowDetails(!isShowDetails)}
              >
                <IconInfoCircle className="mr-2 h-5 w-5" />
                {!isShowDetails ? "Show" : "Hide"} Details
              </button>
            </div>
          }
          isSmallText
        />
      </div>
      {/* Drag & drop zone */}
      <div className="relative m-10 w-full overflow-auto">
        <DndProvider backend={HTML5Backend}>
          {/* TODO: For some reason keying and mutation invalidates did not work when updating layers
            and caused them to be out of order - as a last resort they are being sorted by identifier */}
          {[...taskLayers]
            .sort((a, b) => a.id - b.id)
            .map((taskLayer) => (
              <div
                key={"div_" + taskLayer.id}
                className="flex w-full items-center"
              >
                <HierarchyRow
                  key={taskLayer.id}
                  id={taskLayer.id}
                  // TODO: Context should really be used for this
                  taskLayers={taskLayers}
                  name={taskLayer.name}
                  tasks={taskLayer.tasks || []}
                  moveTaskToLayer={moveTaskToLayer}
                  setEditingModalLayerId={setEditingModalLayerId}
                  setIsModalDeleteOpen={setIsModalDeleteOpen}
                  isShowDetails={isShowDetails}
                  isLoadingTaskLayerUpdates={isLoadingTaskLayerUpdates}
                  hierarchyInstances={hierarchyInstances}
                  isArchived={isArchivedSelected}
                  taskSearchQuery={taskSearchQuery}
                />
              </div>
            ))}
          {/* TODO: place limits on maximum layers (likely 5) */}
          <button
            className={`flex w-full items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600 ${taskLayers.length >= 5 ? "cursor-not-allowed opacity-50" : ""}`}
            onClick={() => setIsModalLayerOpen(true)}
            disabled={taskLayers.length >= 5}
            style={{
              minWidth:
                determineFullColumnItemSpace(hierarchyInstances) + "rem",
            }}
          >
            Insert New Layer
          </button>
          {/* Tasks with no layer */}
          <div
            key={"div_row-tasks-no-layer"}
            className="flex w-full items-center"
          >
            <HierarchyRow
              key={"row-tasks-no-layer"}
              id={null}
              taskLayers={null}
              name={"Tasks with no layer"}
              tasks={defaultLayerTasks || []}
              moveTaskToLayer={moveTaskToLayer}
              setEditingModalLayerId={setEditingModalLayerId}
              setIsModalDeleteOpen={setIsModalDeleteOpen}
              isShowDetails={isShowDetails}
              isLoadingTaskLayerUpdates={isLoadingTaskLayerUpdates}
              hierarchyInstances={undefined}
              isArchived={isArchivedSelected}
              taskSearchQuery={taskSearchQuery}
            />
          </div>
        </DndProvider>
      </div>
    </div>
  );
};

// TODO: Type or Interface? for props
type HierarchyRowProps = {
  id: number | null;
  taskLayers: TaskLayer[] | null;
  name: string;
  tasks: TaskType[];
  moveTaskToLayer: (
    taskId: number,
    toTaskLayer: number | null,
    toTaskParent: number | null,
  ) => void;
  setEditingModalLayerId: (editingModalLayerId: number | null) => void;
  setIsModalDeleteOpen: (isModalDeleteOpen: boolean) => void;
  isShowDetails: boolean;
  isLoadingTaskLayerUpdates: boolean;
  hierarchyInstances?: HierarchyViewItem[];
  isArchived: boolean;
  taskSearchQuery: string;
};

const HierarchyRow = ({
  id,
  taskLayers,
  name,
  tasks,
  moveTaskToLayer,
  setEditingModalLayerId,
  setIsModalDeleteOpen,
  isShowDetails,
  isLoadingTaskLayerUpdates,
  hierarchyInstances,
  isArchived,
  taskSearchQuery,
}: HierarchyRowProps) => {
  // TODO: May be better to just pass layer in
  const currentLayer = taskLayers?.find((layer) => layer.id === id);
  const [isLayerSpecificDrop, setIsLayerSpecificDrop] = useState(true);

  // DragNDrop hook for hierarchy dropzone
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "task",
      // Drop on row with no parent of task
      drop: (item: { id: number }) => moveTaskToLayer(item.id, id, null),
      collect: (monitor: any) => ({
        isOver: !!monitor.isOver(),
      }),
      // Prefer nested item drops, over layer drop
      hover: (_item, monitor: any) => {
        setIsLayerSpecificDrop(monitor.isOver({ shallow: true }));
      },
      canDrop: () => !isLoadingTaskLayerUpdates && isLayerSpecificDrop,
    }),
    [isLoadingTaskLayerUpdates, isLayerSpecificDrop, setIsLayerSpecificDrop],
  );

  return (
    <div
      ref={(instance) => {
        drop(instance);
      }}
      key={id + "_lower_div"}
      className={`center-items flex gap-1 ${isOver && isLayerSpecificDrop ? "bg-blue-100 dark:bg-neutral-950" : ""}`}
      style={{
        minWidth: determineFullColumnItemSpace(hierarchyInstances) + "rem",
      }}
    >
      {/* Row headings */}
      <div
        key={id + "_row_heading"}
        // Unable to mix vars with css sizes: Ensure that 15rem and 5rem matches TASK_ITEM_SIZE expanded and collapsed respectively
        className={`flex ${isShowDetails ? "h-[15.5rem]" : "h-[5rem]"}`}
      >
        <div className="my-[0.25rem] w-40 grow-0">
          {/* TODO: Needing to override colors here, see if there is a better approach; And avoid 'style' */}
          <div className="w-2 rounded-s-lg" />
          <div className="flex h-full items-center justify-between rounded-e-lg bg-gray-200 px-5 py-4 dark:bg-dark-tertiary">
            <h3 className="flex items-center overflow-hidden text-ellipsis text-lg font-semibold dark:text-white">
              {name}
            </h3>
            <div className="flex items-center gap-1">
              <SubMenuDropdown icon={undefined} direction="left">
                <SubMenuButton
                  onClick={() => {
                    setEditingModalLayerId(id);
                  }}
                  icon={<IconEdit size={20} />}
                  label={"Rename Layer"}
                  disabled={false}
                />
                <hr className="my-2 border-slate-200" />
                <SubMenuButton
                  onClick={() => {
                    setIsModalDeleteOpen(true);
                    setEditingModalLayerId(id);
                  }}
                  icon={<IconSquareRoundedX size={20} />}
                  label={"Delete Layer"}
                  disabled={
                    (currentLayer && currentLayer.tasks.length > 0) || false
                  }
                />
              </SubMenuDropdown>
            </div>
          </div>
        </div>
      </div>
      {/* Ensure tasks are in the correct status column */}
      <div className="">
        <div className="absolute">
          <div className={id === null ? "flex" : ""}>
            {tasks
              .filter((task) => task.taskLayerId === id && !task.parentTaskId)
              .map((task) => (
                <div
                  key={task.id}
                  // Default layer should display in row, otherwise position items according to hierarchy
                  className={`${id === null ? "flex" : "absolute"}`}
                  style={{
                    marginLeft: `${id === null ? "0" : determineColumnMargin(task.id, hierarchyInstances)}rem`,
                  }}
                >
                  <DraggableTask
                    task={task}
                    parentTaskTitle={null}
                    isShowDetails={isShowDetails}
                    moveTaskToLayer={moveTaskToLayer}
                    layerId={id}
                    taskLayers={taskLayers}
                    isLoadingTaskLayerUpdates={isLoadingTaskLayerUpdates}
                    // TODO: Put these in global context
                    isArchived={isArchived}
                    taskSearchQuery={taskSearchQuery}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// TODO: Type or Interface? for props
type DraggableTaskProps = {
  task: TaskType;
  parentTaskTitle: string | null;
  isShowDetails: boolean;
  moveTaskToLayer: (
    taskId: number,
    toTaskLayer: number | null,
    toTaskParent: number | null,
  ) => void;
  layerId: number | null;
  taskLayers: TaskLayer[] | null;
  isLoadingTaskLayerUpdates: boolean;
  isArchived: boolean;
  taskSearchQuery: string;
};

const DraggableTask = ({
  task,
  parentTaskTitle,
  isShowDetails,
  moveTaskToLayer,
  layerId,
  taskLayers,
  isLoadingTaskLayerUpdates,
  isArchived,
  taskSearchQuery,
}: DraggableTaskProps) => {
  function moveSubTaskToLayer(dropzoneItemId: number) {
    // Get layer under current task's layer
    const currentTaskLayerIndex = taskLayers?.findIndex(
      (layer) => layer.id === task.taskLayerId,
    );
    const subLayerId = currentTaskLayerIndex
      ? taskLayers?.[currentTaskLayerIndex + 1]?.id || null
      : null;
    moveTaskToLayer(dropzoneItemId, subLayerId, task.id);
  }

  // DragNDrop hook for task dropzone
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "task",
      // Drop on parent task and assign to parent task layer id + 1 (index)
      drop: (item: { id: number }) => moveSubTaskToLayer(item.id),
      collect: (monitor: any) => ({
        isOver: !!monitor.isOver(),
      }),
      canDrop: (item: { id: number }) =>
        !isLoadingTaskLayerUpdates &&
        item.id !== task.parentTaskId &&
        item.id !== task.id &&
        layerId !== null,
    }),
    [task, isLoadingTaskLayerUpdates],
  );
  // DragNDrop hook for draggable task
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "task",
      item: { id: task.id },
      collect: (monitor: any) => ({
        isDragging: !!monitor.isDragging(),
      }),
      // Unable to drag and drop items with children, you must remove the children first
      canDrag: () =>
        !isLoadingTaskLayerUpdates &&
        (task.nestedTasks === undefined ||
          task.nestedTasks === null ||
          task.nestedTasks?.length < 1),
    }),
    [task, isLoadingTaskLayerUpdates],
  );

  // Base case of recursion - no more nested children
  if (task.parentTaskId && !parentTaskTitle) return;

  // Clean up tags
  const taskTagsSplit = task.tags ? task.tags.split(",") : [];
  // Format date strings
  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "P")
    : "";
  const formattedEndDate = task.endDate
    ? format(new Date(task.endDate), "P")
    : "";
  // Display number of comments
  const numberOfComments = (task.comments && task.comments.length) || 0;

  return (
    <>
      <div className="flex w-full justify-center">
        <div
          ref={(instance) => {
            drag(instance);
            drop(instance);
          }}
          style={{ overflow: "hidden" }}
          // Unable to mix vars with css sizes: Ensure that 15rem and 5rem matches TASK_ITEM_SIZE expanded and collapsed respectively;
          // Also ensure that 0.25rem matches TASK_ITEM_MARGIN
          className={`m-[0.25rem] rounded-md ${isShowDetails ? "h-[15rem]" : "h-[5rem]"} ${"w-[15rem]"} shadow ${
            !isCardHighlighted(
              taskSearchQuery,
              isArchived,
              task.title,
              task.description,
              task.archived,
            ) && !isDragging
              ? "opacity-25"
              : isDragging
                ? "opacity-50"
                : "opacity-100"
            // TODO: Change color here to differenciate from rows
          } ${isOver ? "bg-blue-50 dark:bg-neutral-950" : "bg-white dark:bg-dark-secondary"} `}
        >
          <div style={{ overflow: "hidden" }}>
            {/* TODO: Add attachments later
            {task.attachments && task.attachments.length > 0 && (
              <Image
                src={`/${task.attachments[0].fileURL}`}
                alt={task.attachments[0].fileName}
                width={400}
                height={200}
                className="h-auto w-full rounded-t-md"
              />
            )}
            */}
            <div className={isShowDetails ? "p-4 md:p-6" : `p-3`}>
              {isShowDetails && (
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    {task.priority && <PriorityTag priority={task.priority} />}
                    <div className="flex gap-2">
                      {taskTagsSplit.map((tag) => (
                        <div
                          key={tag}
                          className="rounded-full bg-blue-100 px-2 py-1 text-xs"
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="dark:text-nuetral-500 flex h-6 w-4 flex-shrink-0 items-center justify-center">
                    <SubMenuDropdown
                      icon={<IconDotsVertical size={18} />}
                      direction="left"
                    >
                      <Link href={`/tasks/${task.id}`}>
                        <SubMenuButton
                          onClick={() => {}}
                          icon={<IconDoor size={20} />}
                          label={"Open Task"}
                          disabled={false}
                        />
                      </Link>
                    </SubMenuDropdown>
                  </button>
                </div>
              )}
              <div className="my-3 flex justify-between">
                {/* Title */}
                <h4
                  className={`ext-md font-bold dark:text-white ${!isShowDetails && "max-h-[1.5rem]"} overflow-hidden text-ellipsis`}
                >
                  {task.title}{" "}
                  {parentTaskTitle ? `(subtask of '${parentTaskTitle}')` : ""}(
                  {"layer: " + task.taskLayerId}){"Archived: " + task.archived}
                </h4>
              </div>
              {/* TODO: Customize more of this content to filter things out */}
              {isShowDetails && (
                <>
                  {/* Dates */}
                  <div className="text-xs text-gray-500 dark:text-neutral-500">
                    {formattedStartDate && <span>{formattedStartDate} - </span>}
                    {formattedEndDate && <span>{formattedEndDate}</span>}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-neutral-500">
                    {task.description}
                  </p>
                  {/* horizontal rule */}
                  <div className="mt-4 border-t border-gray-200 dark:border-stroke-dark" />
                  <div className="mt-3 flex items-center justify-between">
                    {/* IconUsers */}
                    {/* TODO: Negative space value here? (-space-x-[6px]) */}
                    <div className="flex -space-x-[6px] overflow-hidden">
                      {/* Assignee */}
                      {task.assignee && (
                        <Image
                          key={task.assignee.userId}
                          // Ensure profile picture exists
                          // TODO: Maybe have some extra validation here and have placeholder image
                          src={`/${task.assignee.profilePictureUrl!}`}
                          alt={task.assignee.username}
                          width={30}
                          height={30}
                          className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
                        />
                      )}
                      {/* Author */}
                      {task.author && (
                        <Image
                          key={task.author.userId}
                          // Ensure profile picture exists
                          // TODO: Maybe have some extra validation here and have placeholder image
                          src={`/${task.author.profilePictureUrl!}`}
                          alt={task.author.username}
                          width={30}
                          height={30}
                          className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
                        />
                      )}
                    </div>
                    {/* Comments */}
                    <div className="flex items-center text-gray-500 dark:text-neutral-500">
                      <IconMessage size={20} />
                      <span className="ml-1 text-sm dark:text-neutral-400">
                        {numberOfComments}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Handle Recursive Nested Tasks */}
      <div className="flex">
        {task.nestedTasks?.map((subtask) => (
          <DraggableTask
            key={task.id}
            task={subtask}
            parentTaskTitle={task.title}
            isShowDetails={isShowDetails}
            moveTaskToLayer={moveTaskToLayer}
            layerId={layerId}
            taskLayers={taskLayers}
            isLoadingTaskLayerUpdates={isLoadingTaskLayerUpdates}
            // TODO: Put these in global context
            isArchived={isArchived}
            taskSearchQuery={taskSearchQuery}
          />
        ))}
      </div>
    </>
  );
};

function determineFullColumnItemSpace(
  hierarchyInstances?: HierarchyViewItem[],
) {
  let columnItemsBeforeCurrentLayer = 0;
  let i = 0;
  if (hierarchyInstances) {
    for (i = 0; i < hierarchyInstances.length; i++) {
      const hierarchyInstance = hierarchyInstances[i];
      columnItemsBeforeCurrentLayer += hierarchyInstance.maxItemsPerLayer;
    }
  }
  // Calculates how much space is taken up by boxes before the item
  const previousItemBoxSpace = columnItemsBeforeCurrentLayer * TASK_ITEM_SIZE;
  // Calculates how much margin is around the boxes before the item
  const previousItemBoxMargin =
    columnItemsBeforeCurrentLayer * (TASK_ITEM_MARGIN * 2);
  // Calculates how much spacing to put between hierarchy structures - uses hierarchy index of current item
  const hierarchyOffset = 5 * i;
  // Some extra margin on the end
  const additionalMargin = 10;

  return (
    previousItemBoxSpace +
    previousItemBoxMargin +
    hierarchyOffset +
    additionalMargin
  );
}

function determineColumnMargin(
  taskId: number,
  hierarchyInstances?: HierarchyViewItem[],
) {
  let columnItemsBeforeCurrentLayer = 0;
  let i = 0;
  if (hierarchyInstances) {
    for (i = 0; i < hierarchyInstances.length; i++) {
      const hierarchyInstance = hierarchyInstances[i];
      if (taskId === hierarchyInstance.topTaskId) {
        break;
      }
      columnItemsBeforeCurrentLayer += hierarchyInstance.maxItemsPerLayer;
    }
  }

  // Calculates how much space is taken up by boxes before the item
  const previousItemBoxSpace = columnItemsBeforeCurrentLayer * TASK_ITEM_SIZE;
  // Calculates how much margin is around the boxes before the item
  const previousItemBoxMargin =
    columnItemsBeforeCurrentLayer * (TASK_ITEM_MARGIN * 2);
  // Calculates how much spacing to put between hierarchy structures - uses hierarchy index of current item
  const hierarchyOffset = 5 * i;

  return previousItemBoxSpace + previousItemBoxMargin + hierarchyOffset;
}

export default HierarchyView;
