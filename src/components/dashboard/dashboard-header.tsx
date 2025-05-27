import { Badge } from "@/components/ui";

interface DashboardHeaderProps {
	readonly userName: string;
}

export const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
	const currentDate = new Date();
	return (
		<div className="flex items-center justify-between">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Welcome {userName}!
				</h1>
			</div>
			<div className="flex items-center gap-2">
				<Badge variant="outline" className="hidden sm:flex">
					{currentDate.toLocaleDateString("en-US", {
						month: "long",
						day: "numeric",
						year: "numeric",
					})}
				</Badge>
			</div>
		</div>
	);
};
