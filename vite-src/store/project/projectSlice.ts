import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

// Match the new API response structure
export interface Project {
  id: string;
  name: string;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

const baseUrl = import.meta.env.VITE_PUBLIC_BACKEND_API_URL;
const apiKey = import.meta.env.VITE_PUBLIC_BACKEND_API_KEY;
const isProd = import.meta.env.MODE === "production";

const withKey = (url: string) => isProd ? `${url}?key=${apiKey}` : url;

export const fetchProjects = createAsyncThunk("project/fetchProjects", async () => {
  const response = await fetch(withKey(`${baseUrl}projects`));
  if (!response.ok) throw new Error("Failed to fetch projects");
  return await response.json();
});

export const fetchProjectById = createAsyncThunk("project/fetchProjectById", async (projectId: string) => {
  const response = await fetch(withKey(`${baseUrl}projects/${projectId}`));
  if (!response.ok) throw new Error("Failed to fetch project by ID");
  return await response.json();
});

export const createProject = createAsyncThunk("project/createProject", async (projectName: string) => {
  const response = await fetch(withKey(`${baseUrl}projects`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: projectName }),
  });
  if (!response.ok) throw new Error("Failed to create project");
  return await response.json();
});

export const updateProject = createAsyncThunk("project/updateProject", async ({ id, data }: { id: string; data: any }) => {
  const response = await fetch(withKey(`${baseUrl}projects/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update project");
  return await response.json();
});

export const deleteProject = createAsyncThunk("project/deleteProject", async (projectId: string) => {
  const response = await fetch(withKey(`${baseUrl}projects/${projectId}`), {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete project");
  return projectId;
});


const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<string>) => {
      // Find the project by ID
      const project = state.projects.find((p) => p.id === action.payload);
      if (project) {
        state.currentProject = project;

        // Move the current project to the beginning of the array for the project switcher
        state.projects = [
          project,
          ...state.projects.filter((p) => p.id !== action.payload),
        ];
      }
    },
    setProjects: (state, action: PayloadAction<Project[]>) => {
      // If we have a current project, make sure it stays at the top
      if (state.currentProject) {
        const currentProjectId = state.currentProject.id;
        const currentProjectInNewList = action.payload.find(
          (p) => p.id === currentProjectId
        );

        if (currentProjectInNewList) {
          state.projects = [
            currentProjectInNewList,
            ...action.payload.filter((p) => p.id !== currentProjectId),
          ];
        } else {
          state.projects = action.payload;
        }
      } else {
        state.projects = action.payload;
      }

      // If there's no current project but we have projects, set the first one
      if (!state.currentProject && action.payload.length > 0) {
        state.currentProject = action.payload[0];
      }
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;

        // Assuming action.payload has the API response
        const projects = action.payload.data; // Extract only the 'data' array

        // If we have a current project, make sure it stays at the top
        if (state.currentProject) {
          const currentProjectId = state.currentProject.id;
          const currentProjectInNewList = projects.find(
            (p: Project) => p.id === currentProjectId
          );

          if (currentProjectInNewList) {
            state.projects = [
              currentProjectInNewList,
              ...projects.filter((p: Project) => p.id !== currentProjectId),
            ];
            // Update the current project with the latest data
            state.currentProject = currentProjectInNewList;
          } else {
            state.projects = projects;
            // If current project no longer exists, reset it
            state.currentProject = projects.length > 0 ? projects[0] : null;
          }
        } else {
          state.projects = projects;
          // If there's no current project but we have projects, set the first one
          if (projects.length > 0) {
            state.currentProject = projects[0];
          }
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch projects";
      })
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = [action.payload, ...state.projects];
        state.currentProject = action.payload;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create project";
      })
      // Update Project
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(
          (project) => project.id === action.payload.id
        );
        if (index !== -1) {
          state.projects[index] = action.payload;
          if (state.currentProject?.id === action.payload.id) {
            state.currentProject = action.payload;
          }
        }
      })
      // Delete Project
      .addCase(deleteProject.fulfilled, (state, action) => {
        const projectId = action.payload;
        state.projects = state.projects.filter(
          (project) => project.id !== projectId
        );
        if (state.currentProject?.id === projectId) {
          state.currentProject =
            state.projects.length > 0 ? state.projects[0] : null;
        }
      });
  },
});

export const { setCurrentProject, setProjects, clearCurrentProject } =
  projectSlice.actions;

export default projectSlice.reducer;
