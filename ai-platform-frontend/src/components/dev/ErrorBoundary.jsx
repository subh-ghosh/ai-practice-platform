import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("ErrorBoundary caught:", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div className="has-fixed-navbar page p-6">
          <h2 className="page-title">Something broke on this page</h2>
          <pre className="mt-4 p-4 rounded-xl bg-black/5 dark:bg-white/10 overflow-x-auto text-sm">
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
