import { Request, Response } from "express";
import { PrismaClient, User } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

// Use prisma and grab db data
const prisma = new PrismaClient();

export const getOrgs = async (
  _request: Request,
  response: Response
): Promise<void> => {
  try {
    // Grab full list of orgs (using ORM)
    const orgs = await prisma.org.findMany({
      orderBy: {
        orgName: "asc",
      },
      include: {
        users: true,
      },
    });
    const orgsWithUsernames = await Promise.all(
      orgs.map(async (org: any) => {
        const productOwner = await prisma.user.findUnique({
          // ! - Ensure productOwnerUserId number exists
          where: { userId: org.productOwnerUserId! },
          select: { username: true },
        });

        const projectManager = await prisma.user.findUnique({
          where: { userId: org.projectManagerUserId! },
          select: { username: true },
        });

        return {
          ...org,
          productOwnerUsername: productOwner?.username,
          projectManagerUsername: projectManager?.username,
        };
      })
    );
    response.json(orgsWithUsernames);
  } catch (error: any) {
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: `Error retrieving orgs - ${error.message}` });
  }
};

export const getOrg = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { orgId } = request.params;
  try {
    //  Grab org with matching id (using ORM)
    const org = await prisma.org.findFirst({
      where: {
        id: Number(orgId),
      },
      include: {
        users: {
          orderBy: {
            username: "asc",
          },
        },
        projects: true,
      },
    });
    response.json(org);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error retrieving org with id: ${orgId} - ${error.message}`,
    });
  }
};

export const createOrg = async (
  request: Request,
  response: Response
): Promise<void> => {
  const {
    orgName,
    description,
    productOwnerUserId,
    projectManagerUserId,
    createdByUserId,
  } = request.body.partialOrg;
  const users = request.body.users;

  try {
    // Create a new task (using ORM)
    const newOrg = await prisma.org.create({
      data: {
        orgName,
        description,
        productOwnerUserId: Number(productOwnerUserId),
        projectManagerUserId: Number(projectManagerUserId),
        createdByUserId: Number(createdByUserId),
        users: {
          connect:
            users.map((userId: User) => ({ userId: Number(userId) })) || [],
        },
      },
    });
    response.status(StatusCodes.CREATED).json(newOrg);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error creating new org with title: '${orgName}' - ${error.message}`,
    });
  }
};

export const updateOrg = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { orgId } = request.params;
  const { orgName, description, productOwnerUserId, projectManagerUserId } =
    request.body.partialOrg;
  const users = request.body.users;

  try {
    const updatedOrg = await prisma.org.update({
      where: {
        id: Number(orgId),
      },
      data: {
        orgName,
        description,
        productOwnerUserId: Number(productOwnerUserId),
        projectManagerUserId: Number(projectManagerUserId),
        users: {
          set: users.map((userId: User) => ({ userId: Number(userId) })) || [],
        },
      },
    });
    response.json(updatedOrg);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error updating org with id: ${orgId} - ${error.message}`,
    });
  }
};

export const deleteOrg = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { orgId } = request.params;
  try {
    // Delete org (using ORM)
    const orgTask = await prisma.org.delete({
      where: {
        id: Number(orgId),
      },
    });
    response.status(StatusCodes.OK).json(orgTask);
  } catch (error: any) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: `Error deleting org with id: '${orgId}' - ${error.message}`,
    });
  }
};
