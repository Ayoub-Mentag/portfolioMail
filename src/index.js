const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors');
const nodemailer = require("nodemailer");
const functions = require('firebase-functions');

const app = express()
const port = 5000
let dotenv = require('dotenv').config()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors());
// parse application/json
app.use(bodyParser.json())


app.get('/hello', (req, res) => {
    res.send('Hello vro!')
})


app.post('/hello', async (req, res) => {
    console.log("BODY ", req.body);
    const {email, subject, body} = req.body;
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({  
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: dotenv.parsed.USER_EMAIL,
            pass: dotenv.parsed.USER_PASS,
        },
        // auth: {
        //     user: 'maurice.schoen@ethereal.email',
        //     pass: '7Pj2fMqY8MP2mv5TJM'
        // }
    });
    console.log("TRANSPORTER " , transporter);
    const toBeSend = `<html><body><h4>From ${email}</h4><h4>To ${dotenv.parsed.MAIN_EMAIL}</h4><h4>Subject</h4><p>${subject}</p><h4>Body</h4><p>${body}</p></body></html>`;
    const msg = {
        from: `${email}`, // list of receivers
        to: dotenv.parsed.MAIN_EMAIL, // sender address
        subject: "Sup", // Subject line
        html: toBeSend, // plain text body
    }
    // const toBeSend = `<html><body><h4>From ${email}</h4><h4>To ${dotenv.parsed.MAIN_EMAIL}</h4><h4>Subject ${msg.subject}</h4><p>Body: <br> ${msg.subject}</p></body></html>`;
    // send mail with defined transport object
    const info = await transporter.sendMail(msg);

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    
    res.send('Email Sent!')
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

exports.api = functions.https.onRequest(app)