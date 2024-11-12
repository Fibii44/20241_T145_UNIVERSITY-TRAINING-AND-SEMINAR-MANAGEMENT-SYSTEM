const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const createGmailClient = async (accessToken, refreshToken) => {
  try {
    const oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/auth/google/callback'
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    return google.gmail({ version: 'v1', auth: oauth2Client });
  } catch (error) {
    console.error('Error creating Gmail client:', error);
    throw error;
  }
};

const sendEmail = async (to, subject, text, { accessToken, refreshToken }) => {
  try {
    console.log('Sending email with tokens:', {
      accessToken: accessToken?.substring(0, 20) + '...',
      refreshToken: refreshToken?.substring(0, 20) + '...'
    });

    const gmail = await createGmailClient(accessToken, refreshToken);

     // Create email with proper headers
     const emailLines = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=utf-8',
        'Content-Transfer-Encoding: 7bit',
        `From: BukSU Engage <${process.env.GMAIL_USER}>`,
        `Reply-To: no-reply@buksu.edu.ph`,
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        text,
        '',
        '---',
        'This is an official email from BukSU Engage.',
        'Please do not reply to this email.',
        `© ${new Date().getFullYear()} Bukidnon State University. All rights reserved.`
      ].join('\r\n');

    // Encode the email
    const encodedEmail = Buffer.from(emailLines)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail
      }
    });

    console.log('Email sent successfully:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;