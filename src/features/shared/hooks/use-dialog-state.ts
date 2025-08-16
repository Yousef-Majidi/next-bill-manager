"use client";

import { useState } from "react";

export enum DialogType {
	MAIN = "main", // for add, edit, or email preview dialogs
	DELETE = "delete", // for delete confirmation dialog
}

export const useDialogState = () => {
	const [openDialog, setOpenDialog] = useState<DialogType | null>(null);
	const [itemIdToDelete, setItemIdToDelete] = useState<string | null>(null);

	const toggleDialog = (type: DialogType) => {
		setOpenDialog((prev) => (prev === type ? null : type));
	};

	return {
		mainDialogOpen: openDialog === DialogType.MAIN,
		deleteDialogOpen: openDialog === DialogType.DELETE,
		itemIdToDelete,
		toggleDialog,
		setItemIdToDelete,
	};
};
