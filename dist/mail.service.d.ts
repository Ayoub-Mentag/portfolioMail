import { EmailOptions, EnvironmentVariables } from './types';
export declare class MailService {
    private transporter;
    private envVars;
    constructor(envVars: EnvironmentVariables);
    private initTransporter;
    sendEmail(options: EmailOptions): Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    generateEmailHTML(fromEmail: string, subject: string, body: string): string;
}
//# sourceMappingURL=mail.service.d.ts.map