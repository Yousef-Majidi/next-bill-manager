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
						<div className="rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 p-3">
							<UserPlus className="h-6 w-6 text-blue-600" />
						</div>
						<div>
							<DialogTitle className="text-xl font-semibold text-gray-900">
								Add New Provider
							</DialogTitle>
							<DialogDescription className="text-gray-600">
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
								<div className="rounded-lg bg-blue-100 p-2">
									<Building2 className="h-4 w-4 text-blue-600" />
								</div>
								<h3 className="text-lg font-semibold text-gray-900">
									Basic Information
								</h3>
							</div>

							<div className="space-y-4">
								<div>
									<Label
										htmlFor="name"
										className="text-sm font-medium text-gray-700">
										Provider Name
									</Label>
									<Input
										id="name"
										{...register("name")}
										placeholder="e.g., City Electric Company"
										className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
									/>
									{errors.name && (
										<p className="mt-1 text-sm text-red-500">
											{errors.name.message}
										</p>
									)}
								</div>

								<div>
									<Label
										htmlFor="category"
										className="text-sm font-medium text-gray-700">
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
										<SelectTrigger className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value={Category.Electricity}>
												<div className="flex items-center gap-2">
													<Zap className="h-4 w-4 text-yellow-600" />
													{Category.Electricity}
												</div>
											</SelectItem>
											<SelectItem value={Category.Water}>
												<div className="flex items-center gap-2">
													<Droplets className="h-4 w-4 text-blue-600" />
													{Category.Water}
												</div>
											</SelectItem>
											<SelectItem value={Category.Gas}>
												<div className="flex items-center gap-2">
													<Flame className="h-4 w-4 text-orange-600" />
													{Category.Gas}
												</div>
											</SelectItem>
											<SelectItem value="Internet">
												<div className="flex items-center gap-2">
													<Globe className="h-4 w-4 text-green-600" />
													Internet
												</div>
											</SelectItem>
											<SelectItem value="OTHER">
												<div className="flex items-center gap-2">
													<Building2 className="h-4 w-4 text-gray-600" />
													Other
												</div>
											</SelectItem>
										</SelectContent>
									</Select>
									{errors.category && (
										<p className="mt-1 text-sm text-red-500">
											{errors.category.message}
										</p>
									)}
								</div>
							</div>
						</div>
						{/* Contact Information Section */}
						<div className="space-y-4">
							<div className="mb-4 flex items-center gap-2">
								<div className="rounded-lg bg-green-100 p-2">
									<Mail className="h-4 w-4 text-green-600" />
								</div>
								<h3 className="text-lg font-semibold text-gray-900">
									Contact Information
								</h3>
							</div>

							<div className="space-y-4">
								<div>
									<Label
										htmlFor="email"
										className="text-sm font-medium text-gray-700">
										Email (Optional)
									</Label>
									<Input
										id="email"
										type="email"
										{...register("email")}
										placeholder="e.g., billing@provider.com"
										className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
									/>
									{errors.email && (
										<p className="mt-1 text-sm text-red-500">
											{errors.email.message}
										</p>
									)}
								</div>

								<div>
									<Label
										htmlFor="website"
										className="text-sm font-medium text-gray-700">
										Website (Optional)
									</Label>
									<Input
										id="website"
										type="url"
										{...register("website")}
										placeholder="e.g., https://provider.com"
										className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
									/>
									{errors.website && (
										<p className="mt-1 text-sm text-red-500">
											{errors.website.message}
										</p>
									)}
								</div>
							</div>
						</div>
					</div>
					<DialogFooter className="gap-3 pt-6">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							className="border-gray-200 hover:bg-gray-50">
							Cancel
						</Button>
						<Button
							type="submit"
							className="border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl">
							<UserPlus className="mr-2 h-4 w-4" />
							Add Provider
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
