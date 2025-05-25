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
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						onConfirm();
					}}>
					<DialogFooter>
						<Button type="submit" variant="destructive">
							Confirm Delete
						</Button>
						<Button type="button" variant="secondary" onClick={onClose}>
							Cancel
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
