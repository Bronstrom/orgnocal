import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

// Use prisma and grab db data
const prisma = new PrismaClient();

export const getTasks = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { projectId, archived, query } = request.query;
  try {
    // Grab full list of tasks based on which project is opened (using task ORM)
    const tasks = await prisma.task.findMany({
      where: {
        projectId: Number(projectId),
        archived: archived === "false" ? false : archived === "true" ? true : undefined,
        OR: [
          { title: { contains: query as string, mode: "insensitive" } },
          { description: { contains: query as string, mode: "insensitive" } },
        ],
      },
      // TODO: This include could be reused
      include: {
        author: true,
        assignee: true,
        taskLayer: true,
        comments: true,
        attachments: true,
        // TODO: Need to make this recursive and add limit to layers
        nestedTasks: {
          include: {
            author: true,
            assignee: true,
            taskLayer: true,
            comments: true,
            attachments: true,
            // TODO: Probably don't need to include this
            parentTask: true,
            nestedTasks: {
              include: {
                author: true,
                assignee: true,
                taskLayer: true,
                comments: true,
                attachments: true,
                // TODO: Probably don't need to include this
                parentTask: true,
              },
            },
          },
        },
      },
    });
    response.json(tasks);
  } catch (error: any) {
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: `Error retrieving tasks - ${error.message}` });
  }
};

export const getTask = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { taskId } = request.params;
  try {
    // Grab task with matching id (using task ORM)
    const task = await prisma.task.findFirst({
      where: {
        id: Number(taskId),
      },
      // TODO: This include could be reused
      include: {
        author: true,
        assignee: true,
        taskLayer: true,
        comments: {
          include: {
            user: true,
            deletedBy: true,
          },
        },
        attachments: true,
        // TODO: Need to make this recursive and add limit to layers
        nestedTasks: {
          include: {
            author: true,
            assignee: true,
            taskLayer: true,
            comments: {
              include: {
                user: true,
                deletedBy: true,
              },
            },
            attachments: true,
            // TODO: Probably don't need to include this
            parentTask: true,
            nestedTasks: {
              include: {
                author: true,
                assignee: true,
                taskLayer: true,
                comments: {
                  include: {
                    user: true,
                    deletedBy: true,
                  },
                },
                attachments: true,
                // TODO: Probably don't need to include this
                parentTask: true,
                nestedTasks: {
                  include: {
                    author: true,
                    assignee: true,
                    taskLayer: true,
                    comments: {
                      include: {
                        user: true,
                        deletedBy: true,
                      },
                    },
                    attachments: true,
                    // TODO: Probably don't need to include this
                    parentTask: true,
                    nestedTasks: {
                      include: {
                        author: true,
                        assignee: true,
                        taskLayer: true,
                        comments: {
                          include: {
                            user: true,
                            deletedBy: true,
                          },
                        },
                        attachments: true,
                        // TODO: Probably don't need to include this
                        parentTask: true,
                        nestedTasks: {
                          include: {
                            author: true,
                            assignee: true,
                            taskLayer: true,
                            comments: {
                              include: {
                                user: true,
                                deletedBy: true,
                              },
                            },
                            attachments: true,
                            // TODO: Probably don't need to include this
                            parentTask: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    response.json(task);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error retrieving task with id: ${taskId} - ${error.message}`,
    });
  }
};

// TODO: Maybe make this assigneed tasks or both assigned and created?
export const getUserTasks = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { userId } = request.params;
  try {
    // Grab full list of tasks based on which project is opened (using task ORM)
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { authorUserId: Number(userId) },
          { assignedUserId: Number(userId) },
          { createdByUserId: Number(userId) },
        ],
      },
      orderBy: {
        endDate: "asc",
      },
      include: {
        author: true,
        assignee: true,
        createdBy: true,
        latestEditedBy: true,
        taskLayer: true,
        // TODO: Need to make this recursive maybe
        nestedTasks: true,
        // TODO: Probably don't need to include this
        parentTask: true,
      },
    });
    response.json(tasks);
  } catch (error: any) {
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: `Error retrieving user tasks - ${error.message}` });
  }
};

export const createTask = async (
  request: Request,
  response: Response
): Promise<void> => {
  const {
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    endDate,
    postedDate,
    size,
    projectId,
    authorUserId,
    assignedUserId,
    createdByUserId,
  } = request.body;
  try {
    // Create a new task (using ORM)
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        tags,
        startDate,
        endDate,
        postedDate,
        size,
        projectId,
        authorUserId,
        assignedUserId,
        createdByUserId,
        archived: false,
      },
    });
    response.status(StatusCodes.CREATED).json(newTask);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error creating new task with title: '${title}' - ${error.message}`,
    });
  }
};

export const updateTask = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { taskId } = request.params;
  const {
    title,
    description,
    status,
    priority,
    tags,
    latestEditDate,
    startDate,
    endDate,
    urls,
    archived,
    parentTaskId,
    authorUserId,
    assignedUserId,
    createdByUserId,
  } = request.body.partialTask;
  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        title: title,
        description: description || undefined,
        status: status || undefined,
        priority: priority || undefined,
        tags: tags || undefined,
        latestEditDate,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        urls: urls || undefined,
        archived: archived,
        // TODO: Double check this doesn't cause any weirdness
        parentTaskId: parentTaskId || undefined,
        authorUserId: authorUserId || undefined,
        assignedUserId: assignedUserId || undefined,
        createdByUserId: createdByUserId || undefined,
      },
    });
    response.json(updatedTask);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error updating task with id: ${taskId} - ${error.message}`,
    });
  }
};

export const updateTaskLayer = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { taskId } = request.params;
  const { taskLayerId, parentTaskId } = request.body;
  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        taskLayerId: taskLayerId,
        parentTaskId: parentTaskId,
      },
    });
    response.json(updatedTask);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error updating task with id: ${taskId} - ${error.message}`,
    });
  }
};

export const updateTaskStatus = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { taskId } = request.params;
  const { status } = request.body;
  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        status: status,
      },
    });
    response.json(updatedTask);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error updating task with id: ${taskId} - ${error.message}`,
    });
  }
};

export const createTaskComment = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { taskId } = request.params;
  const { status } = request.body;
  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        status: status,
      },
    });
    response.json(updatedTask);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error updating task with id: ${taskId} - ${error.message}`,
    });
  }
};

const updateTaskParentHelper = (id: number, taskDTO: any) => {
  return prisma.task.update({
    data: taskDTO,
    where: { id },
    include: {
      nestedTasks: true,
      // TODO: Probably don't need to include this
      parentTask: true,
    },
  });
};

// TODO: Is this used anywhere? - this use to be called updateTask
export const updateTaskParent = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { taskId } = request.params;
  // TODO: Understand DTO
  const { parentTaskId, ...taskDTO } = request.body;
  try {
    const updatedTask = await updateTaskParentHelper(Number(taskId), {
      ...taskDTO,
      parentTask: { connect: { id: parentTaskId } },
    });
    response.json(updatedTask);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error updating task with id: ${taskId} - ${error.message}`,
    });
  }
};

export const deleteTask = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { taskId } = request.params;
  try {
    // Delete task (using ORM)
    const deleteTask = await prisma.task.delete({
      where: {
        id: Number(taskId),
      },
    });
    response.status(StatusCodes.OK).json(deleteTask);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error deleting task with id: '${taskId}' - ${error.message}`,
    });
  }
};
