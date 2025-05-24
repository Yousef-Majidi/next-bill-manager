import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/server/auth/auth";

export default async function DashboardPage() {
	const session = await getServerSession(authOptions);
	console.log("User session:", session);

	return (
		<main>
			<h1>Dashboard</h1>
		</main>
	);
}
