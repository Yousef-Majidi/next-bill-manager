"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Mail, Percent, Users } from "lucide-react";
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
	Slider,
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
			<DialogContent className="max-w-lg">
				<DialogHeader className="space-y-3">
					<div className="flex items-center gap-3">
						<div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-lg">
							<Edit className="text-primary h-5 w-5" />
						</div>
						<div>
							<DialogTitle className="text-foreground text-xl font-semibold">
								Edit Tenant
							</DialogTitle>
							<DialogDescription className="text-muted-foreground">
								Update tenant information and utility share percentages
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>
				<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
					{/* Basic Information Section */}
					<div className="space-y-4">
						<div className="mb-3 flex items-center gap-2">
							<Users className="text-primary h-4 w-4" />
							<h3 className="text-foreground font-semibold">
								Basic Information
							</h3>
						</div>

						<div className="grid gap-4">
							<div>
								<Label
									htmlFor="name"
									className="text-foreground text-sm font-medium">
									Full Name
								</Label>
								<Input
									id="name"
									{...register("name")}
									placeholder="e.g., John Doe"
									className="mt-1"
								/>
								{errors.name && (
									<p className="text-destructive mt-1 text-sm">
										{errors.name.message}
									</p>
								)}
							</div>

							<div>
								<Label
									htmlFor="email"
									className="text-foreground flex items-center gap-1 text-sm font-medium">
									<Mail className="h-3 w-3" />
									Email Address
								</Label>
								<Input
									id="email"
									type="email"
									{...register("email")}
									placeholder="e.g., john@example.com"
									className="mt-1"
								/>
								{errors.email && (
									<p className="text-destructive mt-1 text-sm">
										{errors.email.message}
									</p>
								)}
							</div>

							<div>
								<Label
									htmlFor="secondaryName"
									className="text-foreground text-sm font-medium">
									Secondary Name (Optional)
								</Label>
								<Input
									id="secondaryName"
									{...register("secondaryName")}
									placeholder="e.g., Jane Doe"
									className="mt-1"
								/>
								{errors.secondaryName && (
									<p className="text-destructive mt-1 text-sm">
										{errors.secondaryName.message}
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Utility Shares Section */}
					<div className="space-y-4">
						<div className="mb-3 flex items-center gap-2">
							<Percent className="text-primary h-4 w-4" />
							<h3 className="text-foreground font-semibold">Utility Shares</h3>
						</div>

						<div className="bg-muted space-y-4 rounded-lg p-4">
							{(["Electricity", "Water", "Gas"] as const).map((category) => (
								<div key={category} className="space-y-2">
									<div className="flex items-center justify-between">
										<Label
											htmlFor={category.toLowerCase()}
											className="text-foreground text-sm font-medium">
											{category}
										</Label>
										<div className="flex items-center gap-1">
											<span className="text-foreground text-lg font-semibold">
												{watchedShares?.[category] || 0}
											</span>
											<span className="text-muted-foreground text-sm">%</span>
										</div>
									</div>
									<Slider
										value={[watchedShares?.[category] || 0]}
										onValueChange={(value: number[]) =>
											updateShare(category, value[0] || 0)
										}
										max={100}
										min={0}
										step={1}
										className="w-full"
									/>
								</div>
							))}
						</div>
						{errors.shares && (
							<p className="text-destructive text-sm">
								{errors.shares.message}
							</p>
						)}
					</div>

					<DialogFooter className="gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							className="flex-1">
							Cancel
						</Button>
						<Button type="submit">Update Tenant</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
