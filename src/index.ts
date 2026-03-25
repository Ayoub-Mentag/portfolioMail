import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import functions from 'firebase-functions';
import { MailService } from './mail.service';
import { EmailRequest, EmailResponse, EnvironmentVariables } from './types';

// Load environment variables
const envConfig = dotenv.config();
const env: EnvironmentVariables = envConfig.parsed || {};

const app: Express = express();
const port: number = 5000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(bodyParser.json());

// Initialize mail service
let mailService: MailService;
try {
  mailService = new MailService(env);
} catch (error) {
  console.error('Failed to initialize mail service:', error);
}

// Health check endpoint
app.get('/hello', (req: Request, res: Response): void => {
  res.json({ message: 'Portfolio API is running!', timestamp: new Date().toISOString() });
});

// Email sending endpoint
app.post('/hello', async (req: EmailRequest, res: EmailResponse): Promise<void> => {
  try {
    console.log('Received email request from:', req.body.email);
    
    const { email, subject = 'No Subject', msg = '', body = msg } = req.body;

    // Validation
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email address',
      });
      return;
    }

    if (!body || body.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Message body cannot be empty',
      });
      return;
    }

    if (!env.MAIN_EMAIL) {
      res.status(500).json({
        success: false,
        message: 'Server configuration error: MAIN_EMAIL not set',
      });
      return;
    }

    // Generate email HTML
    const htmlContent = mailService.generateEmailHTML(email, subject, body);

    // Send email
    const result = await mailService.sendEmail({
      from: env.USER_EMAIL || 'noreply@portfolio.com',
      to: env.MAIN_EMAIL,
      subject: `[Portfolio Contact] ${subject}`,
      html: htmlContent,
      replyTo: email,
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Email sent successfully!',
        messageId: result.messageId,
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Failed to send email: ${result.error}`,
      });
    }
  } catch (error) {
    console.error('Error in email endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: `Server error: ${errorMessage}`,
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response): void => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Local development server
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, (): void => {
    console.log(`✅ Portfolio API listening at http://localhost:${port}`);
    console.log(`📧 Email service initialized: ${env.USER_EMAIL ? '✓' : '✗'}`);
  });
}

// Firebase Cloud Function export
export const api = functions.https.onRequest(app);
