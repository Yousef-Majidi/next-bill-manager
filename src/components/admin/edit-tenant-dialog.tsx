"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit } from "lucide-react";
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
import { updateTenant, updateTenantBalance } from "@/lib/data";
import { Tenant } from "@/types";
import { UtilityProviderCategory } from "@/types";

const tenantFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email format"),
	secondaryName: z.string().optional().nullable(),
	outstandingBalance: z.number(),
	shares: z.object({
		[UtilityProviderCategory.Electricity]: z.number().min(0).max(100),
		[UtilityProviderCategory.Water]: z.number().min(0).max(100),
		[UtilityProviderCategory.Gas]: z.number().min(0).max(100),
	}),
});

type TenantFormData = z.infer<typeof tenantFormSchema>;

interface EditTenantDialogProps {
	readonly tenant: Tenant;
	readonly userId: string;
	readonly onClose: () => void;
	readonly onSave: (
		tenantId: string,
		updateData: Parameters<typeof updateTenant>[2],
	) => Promise<void>;
}

export function EditTenantDialog({
	tenant,
	userId,
	onClose,
	onSave,
}: EditTenantDialogProps) {
	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<TenantFormData>({
		resolver: zodResolver(tenantFormSchema),
		defaultValues: {
			name: tenant.name,
			email: tenant.email,
			secondaryName: tenant.secondaryName || null,
			outstandingBalance: tenant.outstandingBalance || 0,
			shares: {
				[UtilityProviderCategory.Electricity]:
					tenant.shares?.[UtilityProviderCategory.Electricity] || 0,
				[UtilityProviderCategory.Water]:
					tenant.shares?.[UtilityProviderCategory.Water] || 0,
				[UtilityProviderCategory.Gas]:
					tenant.shares?.[UtilityProviderCategory.Gas] || 0,
			},
		},
	});

	const watchedShares = watch("shares");

	useEffect(() => {
		setValue("name", tenant.name);
		setValue("email", tenant.email);
		setValue("secondaryName", tenant.secondaryName || null);
		setValue("outstandingBalance", tenant.outstandingBalance || 0);
		setValue("shares", {
			[UtilityProviderCategory.Electricity]:
				tenant.shares?.[UtilityProviderCategory.Electricity] || 0,
			[UtilityProviderCategory.Water]:
				tenant.shares?.[UtilityProviderCategory.Water] || 0,
			[UtilityProviderCategory.Gas]:
				tenant.shares?.[UtilityProviderCategory.Gas] || 0,
		});
	}, [tenant, setValue]);

	const onSubmit = async (data: TenantFormData) => {
		await onSave(tenant.id || "", {
			name: data.name,
			email: data.email,
			...(data.secondaryName !== null && data.secondaryName !== undefined
				? { secondaryName: data.secondaryName }
				: {}),
			shares: data.shares,
		});
		// Update balance separately if it changed
		if (data.outstandingBalance !== tenant.outstandingBalance) {
			await updateTenantBalance(
				userId,
				tenant.id || "",
				data.outstandingBalance,
			);
		}
	};

	const updateShare = (category: string, value: number) => {
		setValue(`shares.${category}` as keyof TenantFormData, value);
	};

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader className="space-y-3">
					<div className="flex items-center gap-3">
						<div className="from-primary/30 via-primary/20 to-primary/10 border-primary/20 rounded-xl border bg-gradient-to-br p-3">
							<Edit className="text-primary h-6 w-6" />
						</div>
						<div>
							<DialogTitle className="text-foreground text-xl font-semibold">
								Edit Tenant
							</DialogTitle>
							<DialogDescription className="text-muted-foreground">
								Update tenant information for {tenant.name}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div className="space-y-4">
						<div>
							<Label htmlFor="name">Name</Label>
							<Input id="name" {...register("name")} />
							{errors.name && (
								<p className="text-destructive mt-1 text-sm">
									{errors.name.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" {...register("email")} />
							{errors.email && (
								<p className="text-destructive mt-1 text-sm">
									{errors.email.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="secondaryName">Secondary Name (Optional)</Label>
							<Input
								id="secondaryName"
								{...register("secondaryName")}
								placeholder="Optional"
							/>
						</div>

						<div>
							<Label htmlFor="outstandingBalance">Outstanding Balance</Label>
							<Input
								id="outstandingBalance"
								type="number"
								step="0.01"
								{...register("outstandingBalance", { valueAsNumber: true })}
							/>
							<p className="text-muted-foreground mt-1 text-xs">
								Negative values indicate credit balance
							</p>
						</div>
					</div>

					<div className="space-y-4">
						<Label>Utility Shares (%)</Label>
						<div className="bg-muted/50 border-border/50 space-y-4 rounded-lg border p-4">
							{(["Electricity", "Water", "Gas"] as const).map((category) => (
								<div key={category} className="space-y-2">
									<div className="flex items-center justify-between">
										<Label className="text-sm font-medium">{category}</Label>
										<span className="text-lg font-semibold">
											{watchedShares?.[category] || 0}%
										</span>
									</div>
									<Slider
										value={[watchedShares?.[category] || 0]}
										onValueChange={(value: number[]) =>
											updateShare(category, value[0] || 0)
										}
										max={100}
										min={0}
										step={1}
									/>
								</div>
							))}
						</div>
					</div>

					<DialogFooter className="gap-3">
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">Update Tenant</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
