const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { google } = require('googleapis');

console.log('Environment check:');
console.log('Current directory:', __dirname);
console.log('.env path:', path.resolve(__dirname, '../../.env'));
console.log('GOOGLE_CREDENTIALS exists:', !!process.env.GOOGLE_CREDENTIALS);

// Add more detailed error handling
if (!process.env.GOOGLE_CREDENTIALS) {
    console.error('Missing GOOGLE_CREDENTIALS. Please check:');
    console.error('1. .env file exists in the project root');
    console.error('2. GOOGLE_CREDENTIALS is properly set in .env');
    console.error('3. .env file is being loaded from correct path');
    throw new Error('GOOGLE_CREDENTIALS environment variable is not set');
}

// Parse the credentials JSON from environment variable
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: [
        'https://www.googleapis.com/auth/forms',
        'https://www.googleapis.com/auth/forms.body',
        'https://www.googleapis.com/auth/forms.responses.readonly',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.readonly'
    ]
});

const initialize = async () => {
    try {
        const client = await auth.getClient();
        const forms = google.forms({ version: 'v1', auth: client });
        const sheets = google.sheets({ version: 'v4', auth: client });
        const drive = google.drive({ version: 'v3', auth: client });

        console.log('Google client initialized successfully');

        return { auth, forms, sheets, drive };
    } catch (error) {
        console.error('Error initializing Google client:', error);
        throw error;
    }
};

module.exports = { initialize };


