"use client"

import React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  sectionName?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * React Error Boundary — catches rendering errors in child components
 * and shows a graceful fallback instead of crashing the entire page.
 *
 * Usage:
 *   <ErrorBoundary sectionName="Report Section">
 *     <ReportSection ... />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[ErrorBoundary] ${this.props.sectionName || "Component"} crashed:`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="card-glass p-6 my-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="text-red-400" size={20} />
            <h3 className="text-white/80 text-sm font-medium">
              {this.props.sectionName
                ? `${this.props.sectionName} failed to load`
                : "Something went wrong"}
            </h3>
          </div>
          <p className="text-white/50 text-xs mb-4">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 text-xs transition-colors"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
