import { cn } from "@/lib/common/cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			className={cn(
				"bg-accent/50 relative overflow-hidden rounded-md",
				"animate-pulse",
				className,
			)}
			{...props}
		/>
	);
}

export { Skeleton };
