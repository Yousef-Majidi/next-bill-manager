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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui";
import { updateUtilityProvider } from "@/lib/data";
import { UtilityProvider } from "@/types";
import { UtilityProviderCategory } from "@/types";

const providerFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	category: z.nativeEnum(UtilityProviderCategory),
	email: z.string().email("Invalid email format").optional().or(z.literal("")),
	website: z.string().url("Invalid URL format").optional().or(z.literal("")),
});

type ProviderFormData = z.infer<typeof providerFormSchema>;

interface EditProviderDialogProps {
	readonly provider: UtilityProvider;
	readonly onClose: () => void;
	readonly onSave: (
		providerId: string,
		updateData: Parameters<typeof updateUtilityProvider>[2],
	) => Promise<void>;
}

export function EditProviderDialog({
	provider,
	onClose,
	onSave,
}: EditProviderDialogProps) {
	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
	} = useForm<ProviderFormData>({
		resolver: zodResolver(providerFormSchema),
		defaultValues: {
			name: provider.name,
			category: provider.category,
			email: provider.email || "",
			website: provider.website || "",
		},
	});

	useEffect(() => {
		setValue("name", provider.name);
		setValue("category", provider.category);
		setValue("email", provider.email || "");
		setValue("website", provider.website || "");
	}, [provider, setValue]);

	const onSubmit = async (data: ProviderFormData) => {
		const updatedProvider: UtilityProvider = {
			...provider,
			name: data.name,
			category: data.category,
			...(data.email
				? { email: data.email }
				: data.email === ""
					? {}
					: { email: provider.email }),
			...(data.website
				? { website: data.website }
				: data.website === ""
					? {}
					: { website: provider.website }),
		};
		await onSave(provider.id || "", updatedProvider);
	};

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl">
				<DialogHeader className="space-y-3">
					<div className="flex items-center gap-3">
						<div className="from-primary/30 via-primary/20 to-primary/10 border-primary/20 rounded-xl border bg-gradient-to-br p-3">
							<Edit className="text-primary h-6 w-6" />
						</div>
						<div>
							<DialogTitle className="text-foreground text-xl font-semibold">
								Edit Provider
							</DialogTitle>
							<DialogDescription className="text-muted-foreground">
								Update provider information for {provider.name}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div className="space-y-4">
						<div>
							<Label htmlFor="name">Provider Name</Label>
							<Input id="name" {...register("name")} />
							{errors.name && (
								<p className="text-destructive mt-1 text-sm">
									{errors.name.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="category">Category</Label>
							<Select
								value={watch("category")}
								onValueChange={(value) =>
									setValue("category", value as UtilityProviderCategory)
								}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.values(UtilityProviderCategory).map((category) => (
										<SelectItem key={category} value={category}>
											{category}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.category && (
								<p className="text-destructive mt-1 text-sm">
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
								placeholder="Optional"
							/>
							{errors.email && (
								<p className="text-destructive mt-1 text-sm">
									{errors.email.message}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="website">Website (Optional)</Label>
							<Input
								id="website"
								type="url"
								{...register("website")}
								placeholder="https://example.com"
							/>
							{errors.website && (
								<p className="text-destructive mt-1 text-sm">
									{errors.website.message}
								</p>
							)}
						</div>
					</div>

					<DialogFooter className="gap-3">
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">Update Provider</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
