import { Project } from "@/state/api";
import React from "react";

type ProjectCardProps = {
  project: Project
};

const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    // TODO: Make common styling Card component
    <div className="mb-3 rounded bg-white p-4 shadow dark:bg-dark-secondary dark:text-white">
      <h4 className="text-md font-bold dark:text-white">{project.name}</h4>
      <p>{project.description}</p>
      <p>Start Date: {project.startDate}</p>
      <p>End Date: {project.endDate}</p>
    </div>
  );
};

export default ProjectCard;
