"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { DollarSign, FileText, Mail, Play, Users } from "lucide-react";
import { toast } from "sonner";

import {
	Button,
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import { signInAsDemo, signInWithGoogle } from "@/features/auth/actions";

function ErrorHandler() {
	const searchParams = useSearchParams();

	useEffect(() => {
		const error = searchParams?.get("error");
		if (error === "CredentialsSignin") {
			toast.error(
				"Demo login failed. Please ensure DEMO_USER_ID, DEMO_USER_EMAIL, and DEMO_USER_NAME are set in your environment variables.",
			);
		}
	}, [searchParams]);

	return null;
}

export default function LandingPage() {
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const result = await signInWithGoogle();

		if (!result.success) {
			console.error("Error signing in with Google:", result.error);
		}
	};

	const handleDemoClick = async () => {
		const result = await signInAsDemo();

		if (!result.success) {
			console.error("Error signing in as demo:", result.error);
			toast.error(result.error || "Failed to sign in as demo user");
		}
	};

	return (
		<div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			<Suspense fallback={null}>
				<ErrorHandler />
			</Suspense>
			<div className="container mx-auto px-4 py-16">
				<div className="mb-16 text-center">
					<h1 className="mb-4 text-4xl font-bold text-gray-900">
						Your Next Bill Manager
					</h1>
					<p className="mb-8 text-xl text-gray-600">
						Simplify utility bill management and tenant billing
					</p>

					<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
						<form onSubmit={handleSubmit}>
							<Button size="lg" className="bg-blue-600 hover:bg-blue-700">
								<Mail className="mr-2 h-5 w-5" />
								Continue with Gmail
							</Button>
						</form>
						<Button
							size="lg"
							variant="outline"
							onClick={handleDemoClick}
							className="border-gray-300 bg-white hover:bg-gray-50">
							<Play className="mr-2 h-5 w-5" />
							Try Demo
						</Button>
					</div>
				</div>

				<div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
					<Card>
						<CardHeader>
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
								<DollarSign className="h-6 w-6 text-blue-600" />
							</div>
							<CardTitle>Bill Management</CardTitle>
							<CardDescription>
								Efficiently manage and track all your utility bills in one place
							</CardDescription>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader>
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
								<Users className="h-6 w-6 text-green-600" />
							</div>
							<CardTitle>Tenant Management</CardTitle>
							<CardDescription>
								Organize tenant information and manage billing relationships
							</CardDescription>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader>
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
								<FileText className="h-6 w-6 text-purple-600" />
							</div>
							<CardTitle>Automated Billing</CardTitle>
							<CardDescription>
								Automatically generate and send bills to tenants via email
							</CardDescription>
						</CardHeader>
					</Card>
				</div>
			</div>
		</div>
	);
}
