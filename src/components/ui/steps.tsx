"use client"
import { cn } from "../../lib/utils"

interface Step {
  label: string
  description?: string
}

interface StepsProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (step: number) => void
  className?: string
}

export function Steps({ steps, currentStep, onStepClick, className }: StepsProps) {
  return (
    <div className={cn("w-full", className)}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isActive = currentStep === index + 1
          const isCompleted = currentStep > index + 1
          const isClickable = onStepClick && (isCompleted || index === currentStep - 1)

          return (
            <li
              key={index}
              className={cn(
                "flex items-center",
                index < steps.length - 1 ? "w-full" : "",
                isClickable ? "cursor-pointer" : "",
              )}
              onClick={() => isClickable && onStepClick(index + 1)}
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="w-3.5 h-3.5"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 16 12"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 5.917 5.724 10.5 15 1.5"
                      />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="mt-2">
                  <h3
                    className={cn(
                      "text-sm font-medium",
                      isActive || isCompleted ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </h3>
                  {step.description && (
                    <p className="text-xs text-muted-foreground hidden md:block">{step.description}</p>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn("w-full h-0.5 mx-2", isCompleted ? "bg-primary" : "bg-muted-foreground/30")}></div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
