"use client";

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
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add New Provider</DialogTitle>
					<DialogDescription>
						Add a new utility provider to your account
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(handleFormSubmit)}>
					<div className="space-y-4">
						<div>
							<Label htmlFor="name">Provider Name</Label>
							<Input
								id="name"
								{...register("name")}
								placeholder="e.g., City Electric Company"
							/>
							{errors.name && (
								<p className="text-sm text-red-500">{errors.name.message}</p>
							)}
						</div>
						<div>
							<Label htmlFor="category">Category</Label>
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
								<SelectTrigger>
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={Category.Electricity}>
										{Category.Electricity}
									</SelectItem>
									<SelectItem value={Category.Water}>
										{Category.Water}
									</SelectItem>
									<SelectItem value={Category.Gas}>{Category.Gas}</SelectItem>
									<SelectItem value="Internet">Internet</SelectItem>
									<SelectItem value="OTHER">Other</SelectItem>
								</SelectContent>
							</Select>
							{errors.category && (
								<p className="text-sm text-red-500">
									{errors.category.message}
								</p>
							)}
						</div>
						<div>
							<Label htmlFor="email">Email (Optional)</Label>
							<Input
								id="email"
								type="email"
								{...register("email")}
								placeholder="e.g., billing@provider.com"
							/>
							{errors.email && (
								<p className="text-sm text-red-500">{errors.email.message}</p>
							)}
						</div>
						<div>
							<Label htmlFor="website">Website (Optional)</Label>
							<Input
								id="website"
								type="url"
								{...register("website")}
								placeholder="e.g., https://provider.com"
							/>
							{errors.website && (
								<p className="text-sm text-red-500">{errors.website.message}</p>
							)}
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="secondary" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">Add Provider</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
