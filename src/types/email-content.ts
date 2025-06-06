export interface EmailContent {
	readonly subject: string;
	readonly body: string;
	readonly attachments?: {
		readonly fileName: string;
		readonly fileType: string;
		readonly fileSize: number; // in bytes
	}[];
}
