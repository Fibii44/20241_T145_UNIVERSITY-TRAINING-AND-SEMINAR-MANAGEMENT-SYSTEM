const { google } = require('googleapis');
const fs = require('fs');
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

    oauth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        console.log('New refresh token received. Updating .env file...');
        updateEnvFile('GMAIL_REFRESH_TOKEN', tokens.refresh_token); // Update .env file
      }
      console.log('New access token:', tokens.access_token);
    });

    await oauth2Client.getAccessToken();

    return google.gmail({ version: 'v1', auth: oauth2Client });
  } catch (error) {
    console.error('Error creating Gmail client:', error);
    throw error;
  }
};

const sendEmail = async (to, subject, text, { accessToken, refreshToken, attachments = [] }) => {
  try {
    console.log('Sending email with tokens:', {
      accessToken: accessToken?.substring(0, 20) + '...',
      refreshToken: refreshToken?.substring(0, 20) + '...'
    });

    const gmail = await createGmailClient(accessToken, refreshToken);
    const boundary = `----=${Date.now().toString(36)}`;
    const textBoundary = `----=Text${Date.now().toString(36)}`;

    // Create email with proper headers
    const emailLines = [
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      `From: BukSU Engage <${process.env.GMAIL_USER}>`,
      `Reply-To: no-reply@buksu.edu.ph`,
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      `--${boundary}`,
      `Content-Type: multipart/alternative; boundary="${textBoundary}"`,
      '',
      `--${textBoundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      text.trim(),  // Trim to remove extra whitespace
      '',
      `--${textBoundary}--`,
      ''
    ];

    // Add attachments if present
    for (const attachment of attachments) {
      const fileContent = fs.readFileSync(attachment.path);
      const base64Data = fileContent.toString('base64');

      emailLines.push(`--${boundary}`);
      emailLines.push(`Content-Type: ${attachment.contentType}`);
      emailLines.push('Content-Transfer-Encoding: base64');
      emailLines.push(`Content-Disposition: attachment; filename="${attachment.filename}"`);
      emailLines.push('');
      emailLines.push(base64Data);
      emailLines.push('');
    }

    // Add final boundary and footer
    emailLines.push(`--${boundary}--`);
    emailLines.push('');
    emailLines.push('---');
    emailLines.push('This is an official email from BukSU Engage.');
    emailLines.push('Please do not reply to this email.');
    emailLines.push(`© ${new Date().getFullYear()} Bukidnon State University. All rights reserved.`);

    // Encode the email
    const encodedEmail = Buffer.from(emailLines.join('\r\n'))
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