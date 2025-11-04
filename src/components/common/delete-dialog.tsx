"use client";

import { AlertTriangle, Trash2 } from "lucide-react";

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui";

interface DeleteDialogProps {
	readonly isOpen: boolean;
	readonly title: string;
	readonly description: string;
	readonly onClose: () => void;
	readonly onConfirm: () => void;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
	isOpen,
	title,
	description,
	onClose,
	onConfirm,
}) => {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader className="space-y-4">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
							<AlertTriangle className="h-6 w-6 text-red-600" />
						</div>
						<div>
							<DialogTitle className="text-xl font-semibold text-gray-900">
								{title}
							</DialogTitle>
							<DialogDescription className="mt-1 text-gray-600">
								{description}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="rounded-lg border border-red-200 bg-red-50 p-4">
					<div className="flex items-start gap-3">
						<Trash2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
						<div>
							<p className="text-sm font-medium text-red-800">
								This action cannot be undone
							</p>
							<p className="mt-1 text-sm text-red-700">
								All tenant data, including payment history and utility shares,
								will be permanently removed.
							</p>
						</div>
					</div>
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						onConfirm();
					}}>
					<DialogFooter className="gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							className="flex-1">
							Cancel
						</Button>
						<Button
							type="submit"
							variant="destructive"
							className="flex-1 bg-red-600 text-white shadow-lg transition-all duration-200 hover:bg-red-700 hover:shadow-xl">
							<Trash2 className="mr-2 h-4 w-4" />
							Delete Tenant
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
