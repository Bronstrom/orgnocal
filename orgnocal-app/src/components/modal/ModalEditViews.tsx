import React from "react";
import {
  Project,
  ProjectView,
  ProjectViewTypes,
  useCreateProjectViewMutation,
  useDeleteProjectViewMutation,
  useUpdateProjectViewMutation,
} from "@/state/api";
import Modal from "@/components/modal/Modal";

type ModalEditViewsProps = {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
};

function findUnusedViews(currentViews?: ProjectView[]) {
  const allViewTypes = Object.values(ProjectViewTypes).map((value) =>
    value
  );
  if (!currentViews) {
    return;
  }
  const currentViewTypes = currentViews.map((view) => view.viewType);
  return allViewTypes.filter((allType) => !currentViewTypes.includes(allType.toLowerCase()));
}

const ModalEditViews = ({ project, isOpen, onClose }: ModalEditViewsProps) => {
  const [createProjectView, { isLoading: isLoadingCreateProjectView }] = 
    useCreateProjectViewMutation();
  const [updateProjectView, { isLoading: isLoadingUpdateProjectView }] =
    useUpdateProjectViewMutation();
  const [deleteProjectView, { isLoading: isLoadingDeleteProjectView }] =
    useDeleteProjectViewMutation();

  const handleDeleteView = async (viewId: number, projectId: number) => {
    await deleteProjectView({
      viewId,
      projectId,
    });
  };
  const handleAddView = async (projectId: number, viewType: string, projectViewIndex: number) => {
    await createProjectView({
      name: viewType,
      viewType: viewType.toLowerCase(),
      projectId: projectId,
      projectIndex: projectViewIndex
    });
  };

  const unusedViews = findUnusedViews(project?.projectViews);
  const projectViewIndex = project?.projectViews.length || 0
  return (
    // TODO: Add drag and drop support?
    <Modal isOpen={isOpen} onClose={onClose} name={"Edit Project Views"}>
      <p>Disclaimer: By removing a view you will not lose any project data. You can remove and re-add to change the order of views.</p>
      <h1 class="pt-5">Current Views</h1>
      <div className="items-center p-5">
        {!project?.projectViews || project.projectViews.length < 1
          ? <div className="text-gray-400 dark:text-gray-600">No views currently in project</div>
          : project.projectViews.map((view) => (
              <div className="flex justify-between items-center rounded border p-4 w-full shadow hover:bg-gray-100 dark:hover:bg-gray-600">
                {view.name}
                <div className="flex gap-2">
                  <button
                    className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
                    onClick={() => {
                      handleDeleteView(view.id, project.id);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
      </div>
      <h1>Views to Add</h1>
      <div className="items-center p-5">
        {unusedViews.length < 1
          ? <div className="text-gray-400 dark:text-gray-600">All views are being used</div>
          : unusedViews.map((viewType) => (
              <div className="flex justify-between items-center rounded border p-4 w-full shadow hover:bg-gray-100 dark:hover:bg-gray-600">
                {viewType}
                <button
                  className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
                  onClick={() => {handleAddView(project?.id, viewType, projectViewIndex)}}
                >
                  Add
                </button>
              </div>
            ))}
      </div>
    </Modal>
  );
};

export default ModalEditViews;
