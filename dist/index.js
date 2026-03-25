"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const firebase_functions_1 = __importDefault(require("firebase-functions"));
const mail_service_1 = require("./mail.service");
// Load environment variables
const envConfig = dotenv_1.default.config();
const env = envConfig.parsed || {};
const app = (0, express_1.default)();
const port = 5000;
// Middleware
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Initialize mail service
let mailService;
try {
    mailService = new mail_service_1.MailService(env);
}
catch (error) {
    console.error('Failed to initialize mail service:', error);
}
// Health check endpoint
app.get('/hello', (req, res) => {
    res.json({ message: 'Portfolio API is running!', timestamp: new Date().toISOString() });
});
// Email sending endpoint
app.post('/hello', async (req, res) => {
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
        }
        else {
            res.status(500).json({
                success: false,
                message: `Failed to send email: ${result.error}`,
            });
        }
    }
    catch (error) {
        console.error('Error in email endpoint:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            message: `Server error: ${errorMessage}`,
        });
    }
});
// Error handling middleware
app.use((err, req, res) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
    });
});
// Local development server
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`✅ Portfolio API listening at http://localhost:${port}`);
        console.log(`📧 Email service initialized: ${env.USER_EMAIL ? '✓' : '✗'}`);
    });
}
// Firebase Cloud Function export
exports.api = firebase_functions_1.default.https.onRequest(app);
//# sourceMappingURL=index.js.map