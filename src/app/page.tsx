"use client";

import { DollarSign, FileText, Mail, Users } from "lucide-react";
import { signIn } from "next-auth/react";

import {
	Button,
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui";

export default function LandingPage() {
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			await signIn("google", { callbackUrl: "/dashboard" });
		} catch (error) {
			console.error("Error signing in with Google:", error);
		}
	};

	return (
		<div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			<div className="container mx-auto px-4 py-16">
				<div className="mb-16 text-center">
					<h1 className="mb-4 text-4xl font-bold text-gray-900">
						Your Next Bill Manager
					</h1>
					<p className="mb-8 text-xl text-gray-600">
						Simplify utility bill management and tenant billing
					</p>

					<form onSubmit={handleSubmit}>
						{/* <Link href="/dashboard"> */}
						<Button size="lg" className="bg-blue-600 hover:bg-blue-700">
							<Mail className="mr-2 h-5 w-5" />
							Continue with Gmail
						</Button>
						{/* </Link> */}
					</form>
				</div>

				<div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
					<Card>
						<CardHeader>
							<DollarSign className="mb-2 h-8 w-8 text-blue-600" />
							<CardTitle>Manage Bills</CardTitle>
							<CardDescription>
								Track utility bills and automatically split costs among tenants
							</CardDescription>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader>
							<Users className="mb-2 h-8 w-8 text-green-600" />
							<CardTitle>Tenant Management</CardTitle>
							<CardDescription>
								Add tenants and configure their utility share percentages
							</CardDescription>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader>
							<FileText className="mb-2 h-8 w-8 text-purple-600" />
							<CardTitle>Email Bills</CardTitle>
							<CardDescription>
								Send personalized bills to tenants with their share breakdown
							</CardDescription>
						</CardHeader>
					</Card>
				</div>
			</div>
		</div>
	);
}
// test comment
