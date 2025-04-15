// Base API service for making HTTP requests
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

// import { toast } from "@/components/ui/use-toast"


const API_BASE_URL = import.meta.env.VITE_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api"

// VITE_PUBLIC_BACKEND_API
// import.meta.env.VITE_PUBLIC_BACKEND_API_URL

// Helper function to handle API errors
const handleApiError = (error: any) => {
  console.error("API Error:", error)
  const errorMessage = error.response?.data?.message || "An unexpected error occurred"
  // toast({
  //   title: "Error",
  //   description: errorMessage,
  //   variant: "destructive",
  // })
  toast.error(errorMessage)
  throw error
}

// Generic fetch function with error handling
export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw { response, data: errorData }
    }

    return await response.json()
  } catch (error) {
    return handleApiError(error)
  }
}

// Project API endpoints
export const projectApi = {
  getAll: () => fetchApi("/projects"),
  getById: (id: string) => fetchApi(`/projects/${id}`),
  create: (data: any) =>
    fetchApi("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchApi(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi(`/projects/${id}`, {
      method: "DELETE",
    }),
}

// File API endpoints
export const fileApi = {
  getAll: (projectId: string) => fetchApi(`/files?project_id=${projectId}`),
  upload: async (projectId: string, file: File, metadata: any) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("metadata", JSON.stringify(metadata))

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw { response, data: errorData }
      }

      return await response.json()
    } catch (error) {
      return handleApiError(error)
    }
  },
  delete: (projectId: string, fileId: string) =>
    fetchApi(`/projects/${projectId}/files/${fileId}`, {
      method: "DELETE",
    }),
}

