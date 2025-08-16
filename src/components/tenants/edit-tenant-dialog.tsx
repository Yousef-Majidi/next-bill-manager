"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { UpdateTenantRequestSchema } from "@/lib/common/api-contracts";
import { safeExecuteAsync } from "@/lib/common/error-handling";
import { validateWithSchema } from "@/lib/common/type-utils";
import {
	Tenant,
	TenantFormData,
	UtilityProviderCategory as UtilityCategory,
} from "@/types";

// Form schema for tenant editing
const TenantFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email format"),
	secondaryName: z.string().optional(),
	shares: z.object({
		[UtilityCategory.Electricity]: z.number().min(0).max(100),
		[UtilityCategory.Water]: z.number().min(0).max(100),
		[UtilityCategory.Gas]: z.number().min(0).max(100),
	}),
});

type TenantFormSchema = z.infer<typeof TenantFormSchema>;

interface EditTenantDialogProps {
	readonly isOpen: boolean;
	readonly onClose: () => void;
	readonly onSubmit: (data: TenantFormData) => void;
	readonly tenant: Tenant | null;
}

export const EditTenantDialog: React.FC<EditTenantDialogProps> = ({
	isOpen,
	onClose,
	onSubmit,
	tenant,
}) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
		watch,
	} = useForm<TenantFormSchema>({
		resolver: zodResolver(TenantFormSchema),
		defaultValues: {
			name: "",
			email: "",
			secondaryName: "",
			shares: {
				[UtilityCategory.Electricity]: 0,
				[UtilityCategory.Water]: 0,
				[UtilityCategory.Gas]: 0,
			},
		},
	});

	const watchedShares = watch("shares");

	// Update form data when tenant changes
	useEffect(() => {
		if (tenant) {
			reset({
				name: tenant.name,
				email: tenant.email,
				secondaryName: tenant.secondaryName || "",
				shares: {
					[UtilityCategory.Electricity]:
						tenant.shares[UtilityCategory.Electricity],
					[UtilityCategory.Water]: tenant.shares[UtilityCategory.Water],
					[UtilityCategory.Gas]: tenant.shares[UtilityCategory.Gas],
				},
			});
		}
	}, [tenant, reset]);

	const handleFormSubmit = async (data: TenantFormSchema) => {
		const result = await safeExecuteAsync(async () => {
			// Additional runtime validation
			const validation = validateWithSchema(UpdateTenantRequestSchema, data);
			if (!validation.success) {
				throw new Error(`Form validation failed: ${validation.error}`);
			}

			// Convert to TenantFormData format
			const tenantData: TenantFormData = {
				name: data.name,
				email: data.email,
				...(data.secondaryName ? { secondaryName: data.secondaryName } : {}),
				shares: {
					[UtilityCategory.Electricity]:
						data.shares[UtilityCategory.Electricity] ?? 0,
					[UtilityCategory.Water]: data.shares[UtilityCategory.Water] ?? 0,
					[UtilityCategory.Gas]: data.shares[UtilityCategory.Gas] ?? 0,
				},
			};

			onSubmit(tenantData);
		});

		if (!result.success) {
			// Error handling is done by the parent component
			return;
		}
	};

	const updateShare = (category: string, value: number) => {
		// Use a proper type assertion for the setValue function
		(setValue as (name: `shares.${string}`, value: number) => void)(
			`shares.${category}`,
			value,
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Tenant</DialogTitle>
					<DialogDescription>
						Update tenant information and utility share percentages
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(handleFormSubmit)}>
					<div className="space-y-4">
						<div>
							<Label htmlFor="name">Full Name</Label>
							<Input
								id="name"
								{...register("name")}
								placeholder="e.g., John Doe"
							/>
							{errors.name && (
								<p className="text-sm text-red-500">{errors.name.message}</p>
							)}
						</div>

						<div>
							<Label htmlFor="email">Email Address</Label>
							<Input
								id="email"
								type="email"
								{...register("email")}
								placeholder="e.g., john@example.com"
							/>
							{errors.email && (
								<p className="text-sm text-red-500">{errors.email.message}</p>
							)}
						</div>

						<div>
							<Label htmlFor="secondaryName">Secondary Name (Optional)</Label>
							<Input
								id="secondaryName"
								{...register("secondaryName")}
								placeholder="e.g., Jane Doe"
							/>
							{errors.secondaryName && (
								<p className="text-sm text-red-500">
									{errors.secondaryName.message}
								</p>
							)}
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
												value={watchedShares?.[category] || 0}
												onChange={(e) =>
													updateShare(
														category,
														Number.parseInt(e.target.value) || 0,
													)
												}
												className="w-20"
											/>
											<span className="text-muted-foreground text-sm">%</span>
										</div>
									</div>
								))}
							</div>
							{errors.shares && (
								<p className="text-sm text-red-500">{errors.shares.message}</p>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">Update</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
