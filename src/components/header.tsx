import { Link} from "@tanstack/react-router"
import { useSelector } from "react-redux"
import type { RootState } from "../store"

export function Header() {
  // const { currentStep } = useSelector((state: RootState) => state.app)

  return (
    // <div className="min-h-screen bg-background">
    <div>
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          {/* <h1 className="text-2xl font-bold">BSS Optimization Tool</h1> */}
          <nav className="ml-auto flex gap-6">
            {/* <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              Home
            </Link> */}
            {/* <Link
              to="project/select-files"
              className={`text-sm font-medium transition-colors ${currentStep >= 1 ? "hover:text-primary" : "text-muted-foreground cursor-not-allowed"}`}
              activeProps={{ className: "text-primary" }}
              disabled={currentStep < 1}
            >
              Select Files
            </Link>
            <Link
              to="project/configure-settings"
              className={`text-sm font-medium transition-colors ${currentStep >= 2 ? "hover:text-primary" : "text-muted-foreground cursor-not-allowed"}`}
              activeProps={{ className: "text-primary" }}
              disabled={currentStep < 2}
            >
              Configure Settings
            </Link>
            <Link
              to="project/run-analysis"
              className={`text-sm font-medium transition-colors ${currentStep >= 3 ? "hover:text-primary" : "text-muted-foreground cursor-not-allowed"}`}
              activeProps={{ className: "text-primary" }}
              disabled={currentStep < 3}
            >
              Run Analysis
            </Link> */}
          </nav>
        </div>
      </header>
    </div>
  )
}

