"use client";

import { useState } from "react";

import { toast } from "sonner";
import { z } from "zod";

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
import { type TenantFormSchema, tenantFormSchema } from "@/lib/common/utils";
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
	const [formData, setFormData] = useState<TenantFormSchema>({
		name: "",
		email: "",
		secondaryName: "",
		shares: {
			[UtilityCategory.Electricity]: 0,
			[UtilityCategory.Water]: 0,
			[UtilityCategory.Gas]: 0,
		},
	});

	const validateForm = (): boolean => {
		try {
			tenantFormSchema.parse(formData);
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				// Show first error as toast
				const firstError = error.errors[0];
				if (firstError) {
					toast.error(firstError.message);
				}
			}
			return false;
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		// Convert to TenantFormData format
		const tenantData: TenantFormData = {
			name: formData.name,
			email: formData.email,
			...(formData.secondaryName
				? { secondaryName: formData.secondaryName }
				: {}),
			shares: {
				[UtilityCategory.Electricity]:
					formData.shares[UtilityCategory.Electricity] ?? 0,
				[UtilityCategory.Water]: formData.shares[UtilityCategory.Water] ?? 0,
				[UtilityCategory.Gas]: formData.shares[UtilityCategory.Gas] ?? 0,
			},
		};

		onSubmit(tenantData);
		setFormData({
			name: "",
			email: "",
			secondaryName: "",
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

						<div>
							<Label htmlFor="secondaryName">Secondary Name (Optional)</Label>
							<Input
								id="secondaryName"
								value={formData.secondaryName}
								onChange={(e) =>
									setFormData({ ...formData, secondaryName: e.target.value })
								}
								placeholder="e.g., Jane Doe"
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
