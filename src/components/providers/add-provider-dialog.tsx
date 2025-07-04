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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui";
import {
	UtilityProviderCategory as Category,
	UtilityProviderFormData,
} from "@/types";

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
	const [formData, setFormData] = useState<UtilityProviderFormData>({
		name: "",
		category: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
		setFormData({ name: "", category: "" });
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
				<form onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div>
							<Label htmlFor="name">Provider Name</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="e.g., City Electric Company"
								required
							/>
						</div>
						<div>
							<Label htmlFor="category">Category</Label>
							<Select
								value={formData.category}
								onValueChange={(value) =>
									setFormData({ ...formData, category: value })
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
								</SelectContent>
							</Select>
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
