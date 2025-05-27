"use client";

import { useState } from "react";

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
} from "@/components/ui";
import {
	TenantFormData,
	UtilityProviderCategory as UtilityCategory,
} from "@/types";

interface AddTenantDialogProps {
	readonly isOpen: boolean;
	readonly onClose: () => void;
	readonly onSubmit: (data: TenantFormData) => void;
}

export const AddTenantDialog: React.FC<AddTenantDialogProps> = ({
	isOpen,
	onClose,
	onSubmit,
}) => {
	const [formData, setFormData] = useState<TenantFormData>({
		name: "",
		email: "",
		shares: {
			[UtilityCategory.Electricity]: 0,
			[UtilityCategory.Water]: 0,
			[UtilityCategory.Gas]: 0,
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
		setFormData({
			name: "",
			email: "",
			shares: {
				[UtilityCategory.Electricity]: 0,
				[UtilityCategory.Water]: 0,
				[UtilityCategory.Gas]: 0,
			},
		});
	};

	const updateShare = (category: string, value: number) => {
		setFormData({
			...formData,
			shares: { ...formData.shares, [category]: value },
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Add New Tenant</DialogTitle>
					<DialogDescription>
						Add a new tenant and configure their utility share percentages
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div>
							<Label htmlFor="name">Full Name</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="e.g., John Doe"
								required
							/>
						</div>

						<div>
							<Label htmlFor="email">Email Address</Label>
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								placeholder="e.g., john@example.com"
								required
							/>
						</div>

						<div className="space-y-3">
							<Label>Utility Shares (%)</Label>

							<div className="space-y-2">
								{(["Electricity", "Water", "Gas"] as const).map((category) => (
									<div
										key={category}
										className="flex items-center justify-between">
										<Label htmlFor={category.toLowerCase()} className="text-sm">
											{category}
										</Label>
										<div className="flex items-center gap-2">
											<Input
												id={category.toLowerCase()}
												type="number"
												min="0"
												max="100"
												value={formData.shares[category]}
												onChange={(e) =>
													updateShare(
														category,
														Number.parseInt(e.target.value) || 0,
													)
												}
												className="w-20"
												required
											/>
											<span className="text-muted-foreground text-sm">%</span>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">Submit</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
