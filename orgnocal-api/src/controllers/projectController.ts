import { Request, Response } from "express";
import { Org, PrismaClient, User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

// Use prisma and grab db data
const prisma = new PrismaClient();

export const getProjects = async (
  _request: Request,
  response: Response
): Promise<void> => {
  try {
    // Grab full list of projects (using ORM)
    const projects = await prisma.project.findMany({
      orderBy: {
        name: 'asc',
      }
    });
    response.json(projects);
  } catch (error: any) {
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: `Error retrieving project list - ${error.message}` });
  }
};

export const getProject = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { projectId } = request.params;
  try {
    //  Grab project with matching id (using ORM)
    const project = await prisma.project.findFirst({
      where: {
        id: Number(projectId),
      },
      include: {
        projectViews: true,
        taskLayers: true,
        users: true,
        orgs: {
          include: {
            users: true
          }
        }
      },
    });
    response.json(project);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error retrieving project with id: ${projectId} - ${error.message}`,
    });
  }
};

export const createProject = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { project, views } = request.body;
  try {
    // Create initial view list by making json object from input views strings
    let viewsData: any = [];
    views.forEach((view: string, index: number) =>
      viewsData.push({
        // Upcase view
        name: view.charAt(0).toUpperCase() + view.substring(1),
        viewType: view.toLowerCase(),
        projectIndex: index,
      })
    );

    // Grab full list of projects (using ORM)
    const newProject = await prisma.project.create({
      data: {
        name: project.name,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        createdByUserId: project.createdByUserId,
        archived: false,
        projectViews: {
          createMany: {
            data: viewsData,
          },
        },
      },
    });
    response.status(StatusCodes.CREATED).json(newProject);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error creating new project with name: '${project.name}' - ${error.message}`,
    });
  }
};

export const updateProject = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { projectId } = request.params;
  const { name, description, startDate, endDate } = request.body.projectPartial;
  try {
    const updatedProject = await prisma.project.update({
      where: {
        id: Number(projectId),
      },
      data: {
        name,
        // When description has no value, ignore and don't update field
        description: description || undefined,
        startDate,
        endDate,
      },
    });
    response.json(updatedProject);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error updating project with id: ${projectId} - ${error.message}`,
    });
  }
};

export const updateProjectLayers = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { projectId } = request.params;
  const { taskLayers } = request.body;
  try {
    const updatedProject = await prisma.project.update({
      where: {
        id: Number(projectId),
      },
      data: {
        taskLayers: taskLayers,
      },
    });
    response.json(updatedProject);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error updating project with id: ${projectId} - ${error.message}`,
    });
  }
};

export const updateProjectUsers = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { projectId } = request.params;
  const { users, orgs } = request.body;
  try {
    const updatedProject = await prisma.project.update({
      where: {
        id: Number(projectId),
      },
      data: {
        users: {
          set: users.map((userId: User) => ({ userId: Number(userId) })) || [],
        },
        orgs: {
          set: orgs.map((id: Org) => ({ id: Number(id) })) || [],
        },
      },
    });
    response.json(updatedProject);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error updating project with id: ${projectId} - ${error.message}`,
    });
  }
};

export const deleteProject = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { projectId } = request.params;
  try {
    // Delete project (using ORM)
    const deleteProject = await prisma.project.delete({
      where: {
        id: Number(projectId),
      },
    });
    response.status(StatusCodes.OK).json(deleteProject);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error deleting project with id: '${projectId}' - ${error.message}`,
    });
  }
};
