"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class MailService {
    constructor(envVars) {
        this.transporter = null;
        this.envVars = envVars;
        this.initTransporter();
    }
    initTransporter() {
        const { USER_EMAIL, USER_PASS } = this.envVars;
        if (!USER_EMAIL || !USER_PASS) {
            throw new Error('Missing email configuration: USER_EMAIL or USER_PASS');
        }
        this.transporter = nodemailer_1.default.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: USER_EMAIL,
                pass: USER_PASS,
            },
        });
    }
    async sendEmail(options) {
        if (!this.transporter) {
            return { success: false, error: 'Mail transporter not initialized' };
        }
        try {
            const info = await this.transporter.sendMail(options);
            console.log('Email sent successfully. Message ID:', info.messageId);
            return {
                success: true,
                messageId: info.messageId,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error sending email:', errorMessage);
            return {
                success: false,
                error: errorMessage,
            };
        }
    }
    generateEmailHTML(fromEmail, subject, body) {
        return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px;">
            <h2 style="color: #26dcfc; border-bottom: 2px solid #26dcfc; padding-bottom: 10px;">New Message</h2>
            <p><strong>From:</strong> ${fromEmail}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <h3>Message:</h3>
            <p>${body.replace(/\n/g, '<br>')}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #999;">This email was sent from your portfolio contact form.</p>
          </div>
        </body>
      </html>
    `;
    }
}
exports.MailService = MailService;
//# sourceMappingURL=mail.service.js.map