"use client";

import { useRouter } from "next/navigation";
import React, { type ReactNode, useEffect, useState } from "react";

import { Button } from "@/components/ui";
import type { AppError } from "@/lib/common/error-handling";

// error component props
export interface ErrorComponentProps {
	error: Error | AppError;
	reset?: () => void;
	showReset?: boolean;
	showHome?: boolean;
	className?: string;
}

// reusable error component
export function ErrorComponent({
	error,
	reset,
	showReset = true,
	showHome = true,
	className = "",
}: ErrorComponentProps) {
	const router = useRouter();

	useEffect(() => {
		console.error("Error caught:", error);
	}, [error]);

	const userFriendlyMessage = error.message || "An unexpected error occurred.";

	const handleGoHome = () => {
		router.push("/");
	};

	return (
		<div className={`flex h-screen items-center justify-center ${className}`}>
			<div className="flex flex-col items-center text-center">
				<h1 className="text-2xl font-bold text-red-500">
					Oops! Something went wrong.
				</h1>
				<p className="mt-2 text-gray-600">{userFriendlyMessage}</p>
				<div className="mt-4 flex gap-2">
					{showReset && reset && (
						<Button onClick={reset} variant="default">
							Try Again
						</Button>
					)}
					{showHome && (
						<Button onClick={handleGoHome} variant="outline">
							Go Back to Home
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

// error boundary component for catching errors
export function ErrorBoundary({
	children,
	fallback,
}: {
	children: ReactNode;
	fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}) {
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const handleError = (event: ErrorEvent) => {
			setError(event.error);
		};

		window.addEventListener("error", handleError);
		return () => window.removeEventListener("error", handleError);
	}, []);

	if (error) {
		const reset = () => setError(null);
		const FallbackComponent = fallback || ErrorComponent;
		return <FallbackComponent error={error} reset={reset} />;
	}

	return <>{children}</>;
}

// error handling utilities
export function handleAsyncError<T>(
	fn: () => Promise<T>,
	onError?: (error: Error) => void,
): Promise<T | null> {
	return fn().catch((error) => {
		console.error("Async error caught:", error);
		onError?.(error);
		return null;
	});
}

export function createErrorHandler(onError?: (error: Error) => void) {
	return (error: Error) => {
		console.error("Error handled:", error);
		onError?.(error);
	};
}
