import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export enum Status {
  ToDo = "ToDo",
  InProgress = "InProgress",
  InReview = "InReview",
  Completed = "Completed",
}
export enum Priority {
  Critical = "Critical",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Lowest = "Lowest",
}
export enum ProjectViewTypes {
  Board = "Board",
  Calendar = "Calendar",
  Dashboard = "Dashboard",
  Gantt = "Gantt",
  Hierarchy = "Hierarchy",
  Table = "Table",
  Tile = "Tile",
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  users?: User[];
  admin?: User;
  createdBy?: User;
  createdByUserId?: number;
  orgs?: Org[];
  projectViews: ProjectView[];
  taskLayers: TaskLayer[];
  // TODO: Add orgs asociated with project
}

export interface ProjectOrg {
  id: number;

  orgId: number;
  org: Org;

  projectId: number;
  project: Project;
}

export interface User {
  userId?: number;
  cognitoId?: string;
  username: string;
  email: string;
  profilePictureUrl?: string;
  projects?: string[];
  roles?: string[];
  orgId?: number; // TODO: Remove this
  orgs: Org[];
}

export interface Org {
  id: number;
  orgName: string;
  description?: string;
  productOwnerUserId?: number; // TODO: Maybe call this owner
  projectManagerUserId?: number; // TODO: Maybe call this manager
  createdByUserId?: number;
  users: User[];
  projects: Project[];
  // TODO: Add projects asociated with org
}

export interface ProjectView {
  // TODO: Ensure this is correct once schema is updated
  id: number;
  name: string;
  viewType: string;
  projectIndex?: number;
  taskOrder?: string;
  filters?: string;

  projectId: number;
}

export interface Attachment {
  id: number;
  fileURL: string;
  fileName: string;
  uploadedById: number;
}

export interface Comment {
  id: number;
  text: string;
  postedDate?: string; // TODO: Remove this being optional once schema is updated
  latestEditDate?: string;
  taskId: number;
  userId: number;
  deletedAt?: string;
  deletedByUserId?: number;
  // Include options not included in Comment schema
  user?: User;
  deletedBy?: User;
}

export interface TaskLayer {
  id: number;
  name: string;
  tasks: Task[];
  projectId?: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  tags?: string;
  postedDate?: string; // TODO: Remove this being optional once schema is updated
  latestEditDate?: string;
  startDate?: string;
  endDate?: string;
  size?: string;
  urls?: string[];
  projectId: number;
  archived: boolean;

  parentTaskId?: number | null;
  nestedTasks?: Task[];

  createdByUserId?: number;
  latestEditedByUserId?: number;
  authorUserId?: number;
  assignedUserId?: number;
  // Included options not in Task schema
  createdBy?: User
  latestEditedBy?: User
  author?: User;
  assignee?: User;
  taskLayer: TaskLayer;
  taskLayerId: number;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface SearchResults {
  tasks?: Task[];
  projects?: Project[];
  orgs?: Org[];
  users?: User[];
}

// Redux Toolkit (RTK) queries
// TODO: Break this up into seperate files?
export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
  reducerPath: "api",
  tagTypes: [
    "Projects",
    "Tasks",
    "Users",
    "Orgs",
    "TaskLayers",
    "ProjectViews",
  ],
  endpoints: (build) => ({
    /* Projects */
    // TypeScript schema we get from backend, when tag is provided, getProjects is recalled and provides new updated list of projects
    getProjects: build.query<Project[], void>({
      query: () => "projects",
      providesTags: (result) =>
        !result
          ? [{ type: "Projects" as const }]
          : result.map(({ id }) => ({ type: "Projects" as const, id })),
    }),
    getProject: build.query<Project, { projectId: number }>({
      query: ({ projectId }) => `projects/${projectId}`,
      providesTags: (result) =>
        !result
          ? [{ type: "Projects" as const }]
          : [{ type: "Projects" as const, id: result.id }],
    }),
    createProject: build.mutation<
      Project,
      { project: Partial<Project>; views: string[] }
    >({
      query: ({ project, views }) => ({
        url: "projects",
        method: "POST",
        body: { project, views },
      }),
      // When project is created, tells application we need to update tag type "Projects" value, handles getProjects logic again without the need to write it again
      invalidatesTags: ["Projects"],
    }),
    updateProject: build.mutation<
      Project,
      {
        projectId: number;
        projectPartial: Partial<Project>;
      }
    >({
      query: ({ projectId, projectPartial }) => ({
        url: `projects/${projectId}`,
        method: "PATCH",
        body: { projectPartial },
      }),
      // Update only one specific project
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Projects", id: projectId },
      ],
    }),
    updateProjectUsers: build.mutation<Project, { projectId: number; users: string[], orgs: string[] }>({
      query: ({ projectId, users, orgs }) => ({
        url: `projects/${projectId}/update-users`,
        method: "PATCH",
        body: { users, orgs },
      }),
      // Update only one specific task
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Projects", id: projectId },
      ],
    }),
    deleteProject: build.mutation<Project, { projectId: number }>({
      query: ({ projectId }) => ({
        url: `projects/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Projects"],
    }),

    /* Project Views */
    createProjectView: build.mutation<ProjectView, Partial<ProjectView>>({
      query: (projectView) => ({
        url: "views",
        method: "POST",
        body: projectView,
      }),
      // TODO: May need this to be Projects
      invalidatesTags: ["Projects"],
    }),
    updateProjectView: build.mutation<
      ProjectView,
      {
        viewId: number;
        name: string;
        projectId: number;
      }
    >({
      query: ({ viewId, name }) => ({
        url: `views/${viewId}`,
        method: "PATCH",
        body: { name },
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Projects", id: projectId },
        "ProjectViews",
      ],
    }),
    deleteProjectView: build.mutation<
      ProjectView,
      {
        viewId: number;
        projectId: number;
      }
    >({
      query: ({ viewId }) => ({
        url: `views/${viewId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Projects", id: projectId },
      ],
    }),

    /* Project/Task Layers */
    // TODO: Update to TaskLayers or ProjectLayers?
    getProjectLayers: build.query<TaskLayer[], { projectId: number }>({
      query: ({ projectId }) => `layers?projectId=${projectId}`,
      // TODO: Provides TaskLayers doesn't mean anything, likely update project by id
      providesTags: (result) =>
        !result
          ? [{ type: "TaskLayers" as const }]
          : result.map(({ id }) => ({ type: "TaskLayers" as const, id })),
    }),
    createLayer: build.mutation<TaskLayer, Partial<TaskLayer>>({
      query: (taskLayer) => ({
        url: "layers",
        method: "POST",
        body: taskLayer,
      }),
      // When a task is created, tells application we need to update tag type "Tasks" value, handles getTasks logic again without the need to write it again
      invalidatesTags: ["TaskLayers"],
    }),
    updateProjectLayers: build.mutation<
      Task,
      { projectId: number; taskLayers: TaskLayer[] }
    >({
      query: ({ projectId, taskLayers }) => ({
        url: `tasks/${projectId}/status`,
        method: "PATCH",
        body: { taskLayers },
      }),
      // Update only one specific project
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Projects", id: projectId },
      ],
    }),
    // TODO: What is the difference from what is above?
    updateTaskLayer: build.mutation<
      Task,
      {
        taskId: number;
        taskLayerId: number | null;
        parentTaskId: number | null;
      }
    >({
      query: ({ taskId, taskLayerId, parentTaskId }) => ({
        url: `tasks/${taskId}/layer`,
        method: "PATCH",
        body: { taskLayerId, parentTaskId },
      }),
      // Update only one specific task
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: "Tasks", id: taskId },
        "TaskLayers",
      ],
    }),
    updateTaskLayerName: build.mutation<TaskLayer, { layerId: number; name: string }>({
      query: ({ layerId, name }) => ({
        url: `layers/${layerId}`,
        method: "PATCH",
        body: { name },
      }),
      // Update only one specific layer
      invalidatesTags: ["TaskLayers"],
    }),
    deleteTaskLayer: build.mutation<TaskLayer, { layerId: number }>({
      query: ({ layerId }) => ({
        url: `layers/${layerId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TaskLayers"],
    }),

    /* Tasks */
    getTasks: build.query<Task[], { projectId: number; isArchived?: boolean; query: string }>({
      query: ({ projectId, isArchived, query }) =>
        `tasks?projectId=${projectId}&archived=${isArchived}&query=${query}`,
      providesTags: (result) =>
        !result
          ? [{ type: "Tasks" as const }]
          : result.map(({ id }) => ({ type: "Tasks" as const, id })),
    }),
    getTask: build.query<Task, { taskId: number }>({
      query: ({ taskId }) => `tasks/${taskId}`,
      providesTags: (result) =>
        !result
          ? [{ type: "Tasks" as const }]
          : [{ type: "Tasks" as const, id: result.id }],
    }),
    getTasksByUser: build.query<Task[], { userId: number }>({
      query: ({ userId }) => `tasks/user/${userId}`,
      providesTags: (result, _error, { userId }) =>
        !result
          ? [{ type: "Tasks" as const, id: userId }]
          : result.map(({ id }) => ({ type: "Tasks" as const, id })),
    }),
    createTask: build.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: "tasks",
        method: "POST",
        body: task,
      }),
      // When a task is created, tells application we need to update tag type "Tasks" value, handles getTasks logic again without the need to write it again
      invalidatesTags: ["Tasks"],
    }),
    updateTask: build.mutation<
      Task,
      {
        taskId: number;
        partialTask: Partial<Task>;
      }
    >({
      query: ({ taskId, partialTask }) => ({
        url: `tasks/${taskId}`,
        method: "PATCH",
        body: { partialTask },
      }),
      // Update only one specific project
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),
    updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({
      query: ({ taskId, status }) => ({
        url: `tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      // Update only one specific task
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),
    deleteTask: build.mutation<Task, { taskId: number }>({
      query: ({ taskId }) => ({
        url: `tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks"],
    }),

    /* Comments */
    createComment: build.mutation<Comment, { taskId: number; partialComment: Partial<Comment> }>({
      query: ({ taskId, partialComment }) => ({
        url: "comments",
        method: "POST",
        body: { taskId, partialComment },
      }),
      // When a comment is created, tells application we need to update tag type "Tasks" value, handles getTasks logic again without the need to write it again
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),
    softDeleteComment: build.mutation<Comment, { commentId: number; taskId: number; partialComment: Partial<Comment> }>({
      query: ({ commentId, partialComment }) => ({
        url: `comments/${commentId}/soft-delete`,
        method: "PATCH",
        body: { partialComment },
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),

    /* Users */
    getUsers: build.query<User[], void>({
      query: () => "users",
      providesTags: (result) =>
        !result
          ? [{ type: "Users" as const }]
          : result.map(({ userId }) => ({ type: "Users" as const, userId })),
    }),
    getUser: build.query<User, { userId: number }>({
      query: ({ userId }) => `users/${userId}`,
      providesTags: (result) =>
        !result
          ? [{ type: "Users" as const }]
          :
            [{ type: "Users" as const, userId: result.userId }],
    }),

    updateUser: build.mutation<
      User,
      {
        userId: number;
        partialUser: Partial<User>;
      }
    >({
      query: ({ userId, partialUser }) => ({
        url: `users/${userId}`,
        method: "PATCH",
        body: { partialUser },
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "Users", userId: userId },
      ],
    }),
    deleteUser: build.mutation<User, { userId: number }>({
      query: ({ userId }) => ({
        url: `users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),

    /* Orgs */
    getOrgs: build.query<Org[], void>({
      query: () => "orgs",
      providesTags: (result) =>
        !result
          ? [{ type: "Orgs" as const }]
          : result.map(({ id }) => ({ type: "Orgs" as const, id })),
    }),
    getOrg: build.query<Org, { orgId: number }>({
      query: ({ orgId }) => `orgs/${orgId}`,
      providesTags: (result) =>
        !result
          ? [{ type: "Orgs" as const }]
          : [{ type: "Orgs" as const, id: result.id }],
    }),
    createOrg: build.mutation<
      Org,
      { partialOrg: Partial<Org>; users: string[] }
    >({
      query: ({ partialOrg, users }) => ({
        url: "orgs",
        method: "POST",
        body: { partialOrg, users },
      }),
      invalidatesTags: ["Orgs"],
    }),
    updateOrg: build.mutation<
      Org,
      {
        orgId: number;
        partialOrg: Partial<Org>;
        users: string[];
      }
    >({
      query: ({ orgId, partialOrg, users }) => ({
        url: `orgs/${orgId}`,
        method: "PATCH",
        body: { partialOrg, users },
      }),
      invalidatesTags: (_result, _error, { orgId }) => [
        { type: "Orgs", id: orgId },
      ],
    }),
    deleteOrg: build.mutation<Org, { orgId: number }>({
      query: ({ orgId }) => ({
        url: `orgs/${orgId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Orgs"],
    }),

    /* Search */
    search: build.query<SearchResults, string>({
      query: (query) => `search?query=${query}`,
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useUpdateProjectUsersMutation,
  useDeleteProjectMutation,

  useCreateProjectViewMutation,
  useUpdateProjectViewMutation,
  useDeleteProjectViewMutation,

  useCreateLayerMutation,
  useGetProjectLayersQuery,
  useUpdateProjectLayersMutation, // TODO: Can likely remove
  useUpdateTaskLayerMutation,
  useUpdateTaskLayerNameMutation,
  useDeleteTaskLayerMutation,

  useGetTasksQuery,
  useGetTaskQuery,
  useGetTasksByUserQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,

  useCreateCommentMutation,
  useSoftDeleteCommentMutation,

  useGetUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,

  useGetOrgsQuery,
  useGetOrgQuery,
  useCreateOrgMutation,
  useUpdateOrgMutation,
  useDeleteOrgMutation,

  useSearchQuery,
} = api;
