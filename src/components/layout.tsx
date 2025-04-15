import { Outlet } from "@tanstack/react-router"
import { Sidebar } from "./sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Header } from "./header"
// import { Toaster } from "@/components/ui/sonner"

export function Layout() {
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-background">
        <Sidebar />
        <SidebarInset>
          {/* <main className="flex-1 w-full min-h-screen"> */}
          <main className="flex-1 w-full overflow-auto">
            <Header/>
            {/* <div className="container py-6 px-4"> */}
            <div className="container mx-auto p-2">
              <Outlet />
            </div>
            {/* <footer className="border-t py-4">
              <div className="container flex justify-between px-4 text-sm text-muted-foreground">
                <p>© 2025 BSS Optimization Tool</p>
                <p>Version 1.0.0</p>
              </div>
            </footer> */}
            {/* <Toaster/> */}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}



{/* <div className="flex min-h-screen">
<Sidebar />
<main className="flex-1 overflow-auto">
  <div className="container mx-auto p-4">
    <Outlet />
  </div>
</main>
</div> */}