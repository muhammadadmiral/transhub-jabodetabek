import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("TransHub crash:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="app-crash" role="alert">
        <strong>Terjadi kesalahan</strong>
        <p>Aplikasi mengalami gangguan. Muat ulang untuk mencoba lagi.</p>
        <button type="button" onClick={() => window.location.reload()}>Muat ulang</button>
      </div>
    );
  }
}
