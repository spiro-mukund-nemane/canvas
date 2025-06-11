import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

type SearchParams = { key?: string }

// Preserve `key` param in root route
routeTree.options.beforeLoad = ({ search }:{search: SearchParams}) => {
  if (search.key) {
    window.RUNTIME_API_KEY = search.key
    console.log('🔐 Preserved API Key:', search.key)
  }
  return { apiKey: search.key }
}

export const router = createRouter({ basepath:'/retail-pro-max',routeTree, defaultPreload: 'intent' })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}