interface PageHeaderProps {
	readonly title: string;
	readonly subtitle?: string | React.ReactNode;
}

export const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
	return (
		<div className="flex items-center justify-between">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
			</div>
			{subtitle && <div className="flex items-center gap-2">{subtitle}</div>}
		</div>
	);
};
