import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="card max-w-md p-8 text-center">
            <h2 className="text-xl font-bold">Something went wrong</h2>
            <p className="mt-2 text-slate-500">Please refresh the page or try again later.</p>
            <button className="btn-primary mt-6" onClick={() => window.location.reload()}>
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
