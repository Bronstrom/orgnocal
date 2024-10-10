"use client";

import React, { useState } from "react";
import ProjectHeader from "../ProjectHeader";
import BoardView from "../BoardView";
import CalendarView from "../CalendarView";
import DashboardView from "../DashboardView";
import GanttView from "../GanttView";
import HierarchyView from "../HierarchyView";
import TableView from "../TableView";
import TileView from "../TileView";
import ModalNewTask from "@/components/modal/ModalNewTask";

type ProjectProps = {
  params: { id: string };
};
const Project = ({ params }: ProjectProps) => {
  // Destructure parameters
  const { id } = params;

  const [isArchivedSelected, setIsArchivedSelected] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState("");
  const [startAndEndDates, setStartAndEndDates] = useState([]);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");

  function displayActiveView() {
    switch (activeTab) {
      case "Board":
        return (
          <BoardView
            id={id}
            isArchivedSelected={isArchivedSelected}
            taskSearchQuery={taskSearchQuery}
            setIsModalNewTaskOpen={setIsModalNewTaskOpen}
            setNewTaskStatus={setNewTaskStatus}
          />
        );
      case "Calendar":
        return (
          <CalendarView
            id={id}
            isArchivedSelected={isArchivedSelected}
            taskSearchQuery={taskSearchQuery}
            setIsModalNewTaskOpen={setIsModalNewTaskOpen}
            setStartAndEndDates={setStartAndEndDates}
          />
        );
      case "Dashboard":
        return <DashboardView id={id} />;
      case "Gantt":
        return (
          <GanttView
            id={id}
            isArchivedSelected={isArchivedSelected}
            taskSearchQuery={taskSearchQuery}
            setIsModalNewTaskOpen={setIsModalNewTaskOpen}
          />
        );
      case "Hierarchy":
        return (
          <HierarchyView
            id={id}
            isArchivedSelected={isArchivedSelected}
            taskSearchQuery={taskSearchQuery}
            setIsModalNewTaskOpen={setIsModalNewTaskOpen}
          />
        );
      case "Table":
        return (
          <TableView
            id={id}
            isArchivedSelected={isArchivedSelected}
            taskSearchQuery={taskSearchQuery}
          />
        );
      case "Tile":
        return (
          <TileView
            id={id}
            isArchivedSelected={isArchivedSelected}
            taskSearchQuery={taskSearchQuery}
          />
        );
      default:
        return (
          <div className="center-items flex p-8">
            Your viewing a blank project with no Views. Use the plus [+] button above to add a
            new View.
          </div>
        );
    }
  }
  return (
    <div>
      {/* Modal new task */}
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        startAndEndDates={startAndEndDates}
        newTaskStatus={newTaskStatus}
        onClose={() => {
          setIsModalNewTaskOpen(false);
          setStartAndEndDates([]);
          setNewTaskStatus("");
        }}
        projectId={Number(id)}
      />
      {/* Project view tabs */}
      <ProjectHeader
        projectId={id}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isArchivedSelected={isArchivedSelected}
        setIsArchivedSelected={setIsArchivedSelected}
        setIsModalNewTaskOpen={setIsModalNewTaskOpen}
        taskSearchQuery={taskSearchQuery}
        setTaskSearchQuery={setTaskSearchQuery}
      />
      {displayActiveView()}
    </div>
  );
};

export default Project;
