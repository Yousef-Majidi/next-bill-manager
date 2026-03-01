"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	Building2,
	Droplets,
	Flame,
	Globe,
	Mail,
	UserPlus,
	Zap,
} from "lucide-react";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui";
import { CreateProviderRequestSchema } from "@/lib/common/api-contracts";
import { safeExecuteAsync } from "@/lib/common/error-handling";
import { UtilityProviderFormSchema } from "@/lib/common/form-validation";
import { validateWithSchema } from "@/lib/common/type-utils";
import {
	UtilityProviderCategory as Category,
	UtilityProviderFormData,
} from "@/types";

type ProviderFormSchema = z.infer<typeof UtilityProviderFormSchema>;

interface AddDialogProps {
	readonly isOpen: boolean;
	readonly onClose: () => void;
	readonly onSubmit: (data: UtilityProviderFormData) => void;
}

export const AddProviderDialog: React.FC<AddDialogProps> = ({
	isOpen,
	onClose,
	onSubmit,
}) => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
		watch,
	} = useForm<ProviderFormSchema>({
		resolver: zodResolver(UtilityProviderFormSchema),
		defaultValues: {
			name: "",
			category: "Water" as const,
			email: "",
			website: "",
		},
	});

	const watchedCategory = watch("category");

	const handleFormSubmit = async (data: ProviderFormSchema) => {
		const result = await safeExecuteAsync(async () => {
			// Convert empty strings to undefined for validation
			const validationData = {
				name: data.name,
				category: data.category,
				email: data.email && data.email.trim() ? data.email : undefined,
				website: data.website && data.website.trim() ? data.website : undefined,
			};

			// Additional runtime validation
			const validation = validateWithSchema(
				CreateProviderRequestSchema,
				validationData,
			);
			if (!validation.success) {
				throw new Error(`Form validation failed: ${validation.error}`);
			}

			// Convert to UtilityProviderFormData format
			const providerData: UtilityProviderFormData = {
				name: data.name,
				category: data.category,
				...(validationData.email ? { email: validationData.email } : {}),
				...(validationData.website ? { website: validationData.website } : {}),
			};

			onSubmit(providerData);
		});

		if (!result.success) {
			// Error handling is done by the parent component
			return;
		}

		// Reset form on success
		reset();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader className="space-y-3">
					<div className="flex items-center gap-3">
						<div className="bg-primary/20 rounded-xl p-3">
							<UserPlus className="text-primary h-6 w-6" />
						</div>
						<div>
							<DialogTitle className="text-foreground text-xl font-semibold">
								Add New Provider
							</DialogTitle>
							<DialogDescription className="text-muted-foreground">
								Add a new utility provider to your account
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>
				<form onSubmit={handleSubmit(handleFormSubmit)}>
					<div className="space-y-6">
						{/* Basic Information Section */}
						<div className="space-y-4">
							<div className="mb-4 flex items-center gap-2">
								<div className="bg-primary/20 rounded-lg p-2">
									<Building2 className="text-primary h-4 w-4" />
								</div>
								<h3 className="text-foreground text-lg font-semibold">
									Basic Information
								</h3>
							</div>

							<div className="space-y-4">
								<div>
									<Label
										htmlFor="name"
										className="text-foreground text-sm font-medium">
										Provider Name
									</Label>
									<Input
										id="name"
										{...register("name")}
										placeholder="e.g., City Electric Company"
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
										htmlFor="category"
										className="text-foreground text-sm font-medium">
										Category
									</Label>
									<Select
										value={watchedCategory}
										onValueChange={(value) =>
											setValue(
												"category",
												value as
													| "Water"
													| "Gas"
													| "Electricity"
													| "Internet"
													| "OTHER",
											)
										}
										required>
										<SelectTrigger className="mt-1">
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={Category.Electricity}>
												<div className="flex items-center gap-2">
													<Zap className="text-primary h-4 w-4" />
													{Category.Electricity}
												</div>
											</SelectItem>
											<SelectItem value={Category.Water}>
												<div className="flex items-center gap-2">
													<Droplets className="text-primary h-4 w-4" />
													{Category.Water}
												</div>
											</SelectItem>
											<SelectItem value={Category.Gas}>
												<div className="flex items-center gap-2">
													<Flame className="text-primary h-4 w-4" />
													{Category.Gas}
												</div>
											</SelectItem>
											<SelectItem value="Internet">
												<div className="flex items-center gap-2">
													<Globe className="text-primary h-4 w-4" />
													Internet
												</div>
											</SelectItem>
											<SelectItem value="OTHER">
												<div className="flex items-center gap-2">
													<Building2 className="text-muted-foreground h-4 w-4" />
													Other
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
									{errors.category && (
										<p className="text-destructive mt-1 text-sm">
											{errors.category.message}
										</p>
									)}
								</div>
							</div>
						</div>
						{/* Contact Information Section */}
						<div className="space-y-4">
							<div className="mb-4 flex items-center gap-2">
								<div className="bg-primary/20 rounded-lg p-2">
									<Mail className="text-primary h-4 w-4" />
								</div>
								<h3 className="text-foreground text-lg font-semibold">
									Contact Information
								</h3>
							</div>

							<div className="space-y-4">
								<div>
									<Label
										htmlFor="email"
										className="text-foreground text-sm font-medium">
										Email (Optional)
									</Label>
									<Input
										id="email"
										type="email"
										{...register("email")}
										placeholder="e.g., billing@provider.com"
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
										htmlFor="website"
										className="text-foreground text-sm font-medium">
										Website (Optional)
									</Label>
									<Input
										id="website"
										type="url"
										{...register("website")}
										placeholder="e.g., https://provider.com"
										className="mt-1"
									/>
									{errors.website && (
										<p className="text-destructive mt-1 text-sm">
											{errors.website.message}
										</p>
									)}
								</div>
							</div>
						</div>
					</div>
					<DialogFooter className="gap-3 pt-6">
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">
							<UserPlus className="mr-2 h-4 w-4" />
							Add Provider
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
