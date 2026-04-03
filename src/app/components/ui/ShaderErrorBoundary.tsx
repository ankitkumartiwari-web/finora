import React from "react";

interface ShaderErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ShaderErrorBoundaryState {
  hasError: boolean;
}

export class ShaderErrorBoundary extends React.Component<
  ShaderErrorBoundaryProps,
  ShaderErrorBoundaryState
> {
  state: ShaderErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ShaderErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Shader rendering failed. Falling back to static background.", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }

    return this.props.children;
  }
}
