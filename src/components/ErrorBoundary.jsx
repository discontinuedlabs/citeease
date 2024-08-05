import React from "react";
import { EmptyPage } from "./ui/MaterialComponents";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorMessage: "" };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorMessage: error.toString() });
    }

    render() {
        const { hasError, errorMessage } = this.state;
        const { children } = this.props;

        if (hasError) {
            return <EmptyPage title="Something went wrong!" message={errorMessage} />;
        }

        return children;
    }
}

export default ErrorBoundary;
