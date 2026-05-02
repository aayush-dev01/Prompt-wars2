import { Component, type ErrorInfo, type ReactNode } from 'react';
import { cloudLog } from '../lib/cloudLogging';

interface Props {
  children: ReactNode;
  /** Optional fallback UI to display on error. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Global error boundary that catches React render errors,
 * logs them to Google Cloud Logging, and displays a friendly
 * recovery UI instead of a blank screen.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    cloudLog.error('React ErrorBoundary caught an error', {
      error: error.message,
      stack: error.stack ?? '',
      componentStack: info.componentStack ?? '',
    });
  }

  private handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="flex min-h-[60vh] items-center justify-center px-4"
        >
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
            <div className="mb-4 text-4xl" aria-hidden="true">⚠️</div>
            <h2 className="mb-2 text-xl font-bold text-foreground">
              Something went wrong
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              An unexpected error occurred. Your data has been preserved.
            </p>
            <button
              onClick={this.handleReload}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
