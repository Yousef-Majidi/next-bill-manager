import { ReactNode } from "react";

import { twMerge } from "tailwind-merge";

import { Card, CardContent } from "@/components/ui";

interface StatCardProps {
	readonly title: string;
	readonly icon: ReactNode;
	readonly value: string | number;
	readonly description: string;
	readonly className?: string;
	readonly iconClassName?: string;
}

export const StatCard = ({
	title,
	icon,
	value,
	description,
	className = "",
	iconClassName = "",
}: StatCardProps) => {
	return (
		<Card
			className={twMerge(
				"w-full border-0 shadow-lg transition-shadow duration-300 hover:shadow-xl",
				className,
			)}>
			<CardContent className="p-6">
				<div className="mb-4 flex items-center justify-between">
					<div className="from-primary/20 to-primary/5 border-primary/10 rounded-lg border bg-gradient-to-br p-3">
						<div className={twMerge("", iconClassName)}>{icon}</div>
					</div>
					<div className="text-right">
						<p className="text-muted-foreground text-sm font-medium">{title}</p>
						<p className="text-foreground text-2xl font-bold">{value}</p>
					</div>
				</div>
				<p className="text-muted-foreground text-xs">{description}</p>
			</CardContent>
		</Card>
	);
};
