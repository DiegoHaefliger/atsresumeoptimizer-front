import { Component, type ErrorInfo, type ReactNode } from "react";
import { reportClientError } from "../lib/clientErrorReporting";
import { ScreenErrorFallback } from "./ScreenErrorFallback";

type ErrorBoundaryProps = { children: ReactNode };

type ErrorBoundaryState = { error: Error | null; errorId: string | null; reporting: boolean };

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	state: ErrorBoundaryState = { error: null, errorId: null, reporting: false };

	static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
		return { error, errorId: null, reporting: true };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		void reportClientError(error, info.componentStack).then((errorId) => this.setState({ errorId, reporting: false }));
	}

	private retry = () => this.setState({ error: null, errorId: null, reporting: false });

	render() {
		const { error, errorId, reporting } = this.state;
		if (!error) {
			return this.props.children;
		}
		return <ScreenErrorFallback error={error} errorId={errorId} reporting={reporting} onRetry={this.retry} />;
	}
}
