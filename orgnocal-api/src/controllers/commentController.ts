import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

// Use prisma and grab db data
const prisma = new PrismaClient();

export const createComment = async (
  request: Request,
  response: Response
): Promise<void> => {
  const {
    text,
    postedDate,
    userId,
  } = request.body.partialComment;
  const taskId = request.body.taskId;
  try {
    // Create comment (using ORM)
    const newComment = await prisma.comment.create({
      data: {
        text,
        postedDate,
        userId,
        taskId,
      },
    });
    response.status(StatusCodes.CREATED).json(newComment);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error creating new comment for task with id: '${taskId}' - ${error.message}`,
    });
  }
};


export const softDeleteComment = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { commentId } = request.params;
  const {
    deletedAt,
    deletedByUserId,
  } = request.body.partialComment;
  
  const taskId = request.body.taskId;
  try {
    // Soft delete or recover comment using update (using ORM)
    const newComment = await prisma.comment.update({
      where: {
        id: Number(commentId),
      },
      data: {
        deletedAt: deletedAt,
        deletedByUserId: deletedByUserId || undefined,
      },
    });
    response.status(StatusCodes.CREATED).json(newComment);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error soft deleting / recoving comment for task with id: '${commentId}' - ${error.message}`,
    });
  }
};
