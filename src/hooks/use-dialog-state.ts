"use client";

import { useState } from "react";

export enum DialogType {
	MAIN = "main", // for add dialogs
	EDIT = "edit", // for edit dialogs
	DELETE = "delete", // for delete confirmation dialog
}

export const useDialogState = <T = unknown>() => {
	const [openDialog, setOpenDialog] = useState<DialogType | null>(null);
	const [itemIdToDelete, setItemIdToDelete] = useState<string | null>(null);
	const [itemToEdit, setItemToEdit] = useState<T | null>(null);

	const toggleDialog = (type: DialogType) => {
		setOpenDialog((prev) => (prev === type ? null : type));
	};

	return {
		mainDialogOpen: openDialog === DialogType.MAIN,
		editDialogOpen: openDialog === DialogType.EDIT,
		deleteDialogOpen: openDialog === DialogType.DELETE,
		itemIdToDelete,
		itemToEdit,
		toggleDialog,
		setItemIdToDelete,
		setItemToEdit,
	};
};
