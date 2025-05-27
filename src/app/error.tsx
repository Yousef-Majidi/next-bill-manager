"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Error({
	error,
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to the console for debugging purposes
		console.error("Global error caught:", error);
	}, [error]);

	// Extract a user-friendly message from the error
	const userFriendlyMessage = error.message || "An unexpected error occurred.";

	return (
		<div className="flex h-screen items-center justify-center">
			<div className="flex flex-col items-center text-center">
				<h1 className="text-2xl font-bold text-red-500">
					Oops! Something went wrong.
				</h1>
				<p className="mt-2 text-gray-600">{userFriendlyMessage}</p>
				<button
					onClick={() => reset()}
					className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
					Try Again
				</button>
				<button
					onClick={() => redirect("/")}
					className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
					Go Back to Home
				</button>
			</div>
		</div>
	);
}
