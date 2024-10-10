import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

// Use prisma and grab db data
const prisma = new PrismaClient();

export const search = async (
  request: Request,
  response: Response
): Promise<void> => {
  const { query } = request.query;
  try {
    // Using search query discover project by name or description
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: query as string, mode: "insensitive" } },
          { description: { contains: query as string, mode: "insensitive" } },
        ],
      },
    });
    // Using search query discover task by title or description
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: query as string, mode: "insensitive" } },
          { description: { contains: query as string, mode: "insensitive" } },
        ],
      },
    });
    // Using search query discover project by orgName or description
    const orgs = await prisma.org.findMany({
      where: {
        OR: [
          { orgName: { contains: query as string, mode: "insensitive" } },
          { description: { contains: query as string, mode: "insensitive" } },
        ],
      },
    });
    // Using search query discover project by username
    const users = await prisma.user.findMany({
      where: {
        OR: [{ username: { contains: query as string, mode: "insensitive" } }],
      },
    });
    response.json({ projects, tasks, orgs, users });
  } catch (error: any) {
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: `Error performing search request - ${error.message}` });
  }
};
