import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

// Use prisma and grab db data
const prisma = new PrismaClient();

export const getProjectLayers = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { projectId } = request.query;
  try {
    // Grab full list of layers for project layer (using taskLayer ORM)
    const layers = await prisma.taskLayer.findMany({
      where: {
        projectId: Number(projectId),
      },
      // TODO: Implement recursion
      include: {
        tasks: {
          include: {
            nestedTasks: {
              include: {
                nestedTasks: {
                  include: {
                    nestedTasks: {
                      include: {
                        nestedTasks: true,
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
    response.json(layers);
  } catch (error: any) {
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({
        message: `Error retrieving layers for project: ${projectId} - ${error.message}`,
      });
  }
};

export const createLayer = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { name, projectId } = request.body;
  try {
    // Create layer (using ORM)
    const newLayer = await prisma.taskLayer.create({
      data: {
        name,
        projectId,
      },
    });
    response.status(StatusCodes.CREATED).json(newLayer);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error creating new layer with name: '${name}' - ${error.message}`,
    });
  }
};

export const updateLayer = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { layerId } = request.params;
  const { name } = request.body;
  try {
    const updatedLayer = await prisma.taskLayer.update({
      where: {
        id: Number(layerId),
      },
      data: {
        name: name,
      },
    });
    response.json(updatedLayer);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error updating layer with id: ${layerId} - ${error.message}`,
    });
  }
};

export const deleteLayer = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { layerId } = request.params;
  try {
    // Delete task (using ORM)
    const deleteLayer = await prisma.taskLayer.delete({
      where: {
        id: Number(layerId),
      },
    });
    response.status(StatusCodes.OK).json(deleteLayer);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error deleting layer with id: '${layerId}' - ${error.message}`,
    });
  }
};

