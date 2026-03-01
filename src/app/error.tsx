"use client";

import { ErrorComponent } from "@/features/shared/utils";

export default function Error({
	error,
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	return <ErrorComponent error={error} reset={reset} />;
}
