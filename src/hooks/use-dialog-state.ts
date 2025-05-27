"use client";

import { useState } from "react";

export const useDialogState = () => {
	const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
	const [itemIdToDelete, setItemIdToDelete] = useState<string | null>(null);

	const toggleAddDialog = () => {
		setAddDialogOpen((prev) => !prev);
	};

	const toggleDeleteDialog = () => {
		setDeleteDialogOpen((prev) => !prev);
	};

	return {
		addDialogOpen,
		deleteDialogOpen,
		itemIdToDelete,
		setItemIdToDelete,
		toggleAddDialog,
		toggleDeleteDialog,
		setAddDialogOpen,
		setDeleteDialogOpen,
	};
};
