import { ReactNode } from "react";

import { twMerge } from "tailwind-merge";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

interface StatCardProps {
	readonly title: string;
	readonly icon: ReactNode;
	readonly value: string | number;
	readonly description: string;
	readonly className?: string;
}

export const StatCard = ({
	title,
	icon,
	value,
	description,
	className = "",
}: StatCardProps) => {
	return (
		<Card className="w-full sm:w-64">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				{icon}
			</CardHeader>
			<CardContent>
				<div className={twMerge("text-2xl font-bold", className)}>{value}</div>
				<p className="text-muted-foreground text-xs">{description}</p>
			</CardContent>
		</Card>
	);
};
