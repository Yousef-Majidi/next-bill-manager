export interface EmailContent {
	readonly subject: string;
	readonly body: string;
	readonly attachments?: {
		readonly fileName: string;
		readonly fileType: string;
		readonly fileSize: number; // in bytes
	}[];
}

export interface Payment {
	readonly gmailMessageId: string;
	readonly date: string;
	readonly sentFrom: string;
	readonly amount: string;
}
