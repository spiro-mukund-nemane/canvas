// import { type Epic, ofType } from "redux-observable"
// import { from, of } from "rxjs"
// import { catchError, map, mergeMap, switchMap, tap } from "rxjs/operators"
// import type { RootState } from "../index"
// import {
//   fetchProjects,
//   fetchProjectById,
//   createProject,
//   updateProject,
//   deleteProject,
//   setProjects,
//   setProjectLoading,
//   setProjectError,
//   addProject,
//   updateProjectInState,
//   removeProject,
// } from "./projectSlice"

// // Epic for fetching all projects
// const fetchProjectsEpic: Epic<any, any, RootState> = (action$) =>
//   action$.pipe(
//     ofType(fetchProjects.type),
//     tap(() => console.log("Fetching projects...")),
//     switchMap(() => {
//       return from(
//         fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}projects`).then((response) => {
//           if (!response.ok) {
//             throw new Error("Failed to fetch projects")
//           }
//           return response.json()
//         }),
//       ).pipe(
//         mergeMap((response) => of(setProjectLoading(false), setProjects(response))),
//         catchError((error) => of(setProjectLoading(false), setProjectError(error.toString()))),
//       )
//     }),
//   )

// // Epic for fetching a project by ID
// const fetchProjectByIdEpic: Epic<any, any, RootState> = (action$) =>
//   action$.pipe(
//     ofType(fetchProjectById.type),
//     mergeMap((action) => {
//       const projectId = action.payload
//       return from(
//         fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}projects/${projectId}`).then((response) => {
//           if (!response.ok) {
//             throw new Error("Failed to fetch project by ID")
//           }
//           return response.json()
//         }),
//       ).pipe(
//         map((response) => ({ type: "project/fetchProjectById/success", payload: response })),
//         catchError((error) => of(setProjectError(error.toString()))),
//       )
//     }),
//   )

// // Epic for creating a project
// const createProjectEpic: Epic<any, any, RootState> = (action$) =>
//   action$.pipe(
//     ofType(createProject.type),
//     mergeMap((action) => {
//       const projectName = action.payload
//       return from(
//         fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}projects`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ name: projectName }),
//         }).then((response) => {
//           if (!response.ok) {
//             throw new Error("Failed to create project")
//           }
//           return response.json()
//         }),
//       ).pipe(
//         map((response) => addProject(response)),
//         catchError((error) => of(setProjectError(error.toString()))),
//       )
//     }),
//   )

// // Epic for updating a project
// const updateProjectEpic: Epic<any, any, RootState> = (action$) =>
//   action$.pipe(
//     ofType(updateProject.type),
//     mergeMap((action) => {
//       const { id, data } = action.payload
//       return from(
//         fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}projects/${id}`, {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(data),
//         }).then((response) => {
//           if (!response.ok) {
//             throw new Error("Failed to update project")
//           }
//           return response.json()
//         }),
//       ).pipe(
//         map((response) => updateProjectInState(response)),
//         catchError((error) => of(setProjectError(error.toString()))),
//       )
//     }),
//   )

// // Epic for deleting a project
// const deleteProjectEpic: Epic<any, any, RootState> = (action$) =>
//   action$.pipe(
//     ofType(deleteProject.type),
//     mergeMap((action) => {
//       const projectId = action.payload
//       return from(
//         fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_API_URL}projects/${projectId}`, {
//           method: "DELETE",
//         }).then((response) => {
//           if (!response.ok) {
//             throw new Error("Failed to delete project")
//           }
//           return projectId
//         }),
//       ).pipe(
//         map((projectId) => removeProject(projectId)),
//         catchError((error) => of(setProjectError(error.toString()))),
//       )
//     }),
//   )

// export const projectEpics = [
//   fetchProjectsEpic,
//   fetchProjectByIdEpic,
//   createProjectEpic,
//   updateProjectEpic,
//   deleteProjectEpic,
// ]
