import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

// Use prisma and grab db data
const prisma = new PrismaClient();


export const createView = async (
  request: Request,
  response: Response
): Promise<void> => {
  const {
    name,
    viewType,
    projectIndex,
    projectId,
  } = request.body;
  try {
    // Grab full list of projects (using ORM)
    const newView = await prisma.projectView.create({
      data: {
        name,
        viewType,
        projectIndex,
        projectId,
      },
    });
    response.status(StatusCodes.CREATED).json(newView);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error creating new view with name: '${name}' - ${error.message}`,
    });
  }
};

export const updateView = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { viewId } = request.params;
  const {
    name,
    projectIndex,
  } = request.body;
  try {
    // Update view (using ORM)
    const updateView = await prisma.projectView.update({
      where: {
        id: Number(viewId),
      },
      data: {
        // When fields are not passed a value, ignore them and don't update field
        name: name || undefined,
        projectIndex: projectIndex || undefined,
      },
    });
    response.status(StatusCodes.OK).json(updateView);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error updating view with id: '${viewId}' - ${error.message}`,
    });
  }
};

export const deleteView = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { viewId } = request.params;
  try {
    // Delete view (using ORM)
    const deleteView = await prisma.projectView.delete({
      where: {
        id: Number(viewId),
      },
    });
    response.status(StatusCodes.OK).json(deleteView);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error delete view with id: '${viewId}' - ${error.message}`,
    });
  }
};
