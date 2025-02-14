'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: React.ReactNode
  darkMode?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={`p-6 rounded-lg border ${
          this.props.darkMode 
            ? 'bg-gray-800 border-gray-700 text-gray-200' 
            : 'bg-white border-gray-200'
        }`}>
          <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
          <p className={`mb-4 ${
            this.props.darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
            className={this.props.darkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            Try again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}