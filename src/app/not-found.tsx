import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="flex h-screen flex-col items-center justify-center space-y-4">
			<div className="text-center">
				<h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
					404 - Page Not Found
				</h1>
				<p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
					The page you&apos;re looking for doesn&apos;t exist.
				</p>
			</div>
			<Button asChild>
				<Link href="/dashboard">Go to Dashboard</Link>
			</Button>
		</div>
	);
}
