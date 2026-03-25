import nodemailer from 'nodemailer';
import { EmailOptions, EnvironmentVariables } from './types';

export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private envVars: EnvironmentVariables;

  constructor(envVars: EnvironmentVariables) {
    this.envVars = envVars;
    this.initTransporter();
  }

  private initTransporter(): void {
    const { USER_EMAIL, USER_PASS } = this.envVars;

    if (!USER_EMAIL || !USER_PASS) {
      throw new Error('Missing email configuration: USER_EMAIL or USER_PASS');
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: USER_EMAIL,
        pass: USER_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error sending email:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  generateEmailHTML(fromEmail: string, subject: string, body: string): string {
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
