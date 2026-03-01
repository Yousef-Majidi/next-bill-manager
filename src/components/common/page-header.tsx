interface PageHeaderProps {
	readonly title: string;
	readonly subtitle?: string | React.ReactNode;
}

export const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
	return (
		<div className="flex flex-col items-start justify-between">
			<div>
				<h1 className="text-3xl font-bold">{title}</h1>
			</div>
			{subtitle && (
				<div className="text-muted-foreground flex items-center">
					{subtitle}
				</div>
			)}
		</div>
	);
};
