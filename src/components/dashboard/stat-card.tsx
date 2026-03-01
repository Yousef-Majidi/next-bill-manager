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
		<Card className={twMerge("w-full border-0 shadow-sm", className)}>
			<CardContent className="p-6">
				<div className="mb-4 flex items-center justify-between">
					<div className="rounded-lg bg-white/50 p-2">
						<div className={twMerge("", iconClassName)}>{icon}</div>
					</div>
					<div className="text-right">
						<p className="text-sm font-medium text-gray-600">{title}</p>
						<p className="text-2xl font-bold text-gray-900">{value}</p>
					</div>
				</div>
				<p className="text-xs text-gray-500">{description}</p>
			</CardContent>
		</Card>
	);
};
