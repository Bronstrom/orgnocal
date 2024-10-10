import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

// Use prisma and grab db data
const prisma = new PrismaClient();

export const getUsers = async (
  _request: Request,
  response: Response
): Promise<void> => {
  try {
    // Grab full list of users (using ORM)
    const users = await prisma.user.findMany();
    response.json(users);
  } catch (error: any) {
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: `Error retrieving users - ${error.message}` });
  }
};

export const getUser = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { userId } = request.params;
  try {
    // Grab user from list (using ORM)
    const user = await prisma.user.findFirst({
      where: {
        userId: Number(userId),
      },
      include: {
        orgs: true
      },
    });
    response.json(user);
  } catch (error: any) {
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: `Error retrieving users - ${error.message}` });
  }
};

export const updateUser = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { userId } = request.params;
  const { username, roles, profilePictureUrl } = request.body.partialUser;
  try {
    const updatedUser = await prisma.user.update({
      where: {
        userId: Number(userId),
      },
      data: {
        username,
        roles: roles || undefined,
        profilePictureUrl: profilePictureUrl || undefined,
      },
    });
    response.json(updatedUser);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error updating user with id: ${userId} - ${error.message}`,
    });
  }
};

export const deleteUser = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { userId } = request.params;
  try {
    // Delete user (using ORM)
    const deleteUser = await prisma.user.delete({
      where: {
        userId: Number(userId),
      },
    });
    response.status(StatusCodes.OK).json(deleteUser);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error deleting user with id: '${userId}' - ${error.message}`,
    });
  }
};
