import { Mail } from "lucide-react";
import sanitizeHtml from "sanitize-html";

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Separator,
} from "@/components/ui";
import { EmailContent, Tenant } from "@/types";

interface EmailPreviewDialogProps {
	readonly isOpen: boolean;
	readonly tenant: Tenant;
	readonly emailContent: EmailContent;
	readonly onClose: () => void;
	readonly onConfirm: () => void;
}

export const EmailPreviewDialog: React.FC<EmailPreviewDialogProps> = ({
	isOpen,
	tenant,
	emailContent,
	onClose,
	onConfirm,
}) => {
	const sanitizedBody = sanitizeHtml(emailContent.body, {
		allowedTags: sanitizeHtml.defaults.allowedTags.concat([
			"style",
			"table",
			"tr",
			"td",
			"th",
		]),
		allowedAttributes: {
			"*": ["style", "class", "src", "alt"],
		},
	});
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="min-w-4xl">
				<DialogHeader>
					<DialogTitle>Email Preview</DialogTitle>
					<DialogDescription>
						Review the email details before sending.
					</DialogDescription>
				</DialogHeader>
				<div className="bg-muted rounded-lg p-4">
					<div className="flex flex-col gap-3">
						<div>
							<p className="font-medium">
								Subject:{" "}
								<span className="font-bold">{emailContent.subject}</span>
							</p>
						</div>
						<div>
							<p className="font-medium">
								To: <span className="font-bold">{tenant.email}</span>
							</p>
						</div>
						<Separator />
						<div>
							<div
								className="break-word max-h-64 overflow-y-auto rounded border p-2"
								dangerouslySetInnerHTML={{ __html: sanitizedBody }}></div>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={onConfirm}>
						<Mail className="mr-1 h-4 w-4" />
						Send
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
