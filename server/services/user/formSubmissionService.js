const { initialize } = require('../../config/googleConfig');
const { generateAndEmailCertificate } = require('./certificateService');
const { google } = require('googleapis');
const FormSubmission = require('../../models/formSubmission');
const Registration = require('../../models/registration');
const Event = require('../../models/event');
const User = require('../../models/user');

// Helper function to extract form ID from URL
const extractFormId = (formUrl) => {
    try {
        if (!formUrl) return null;
        
        console.log('Extracting form ID from:', formUrl);

        // If it's already just an ID, return it
        if (!formUrl.includes('/')) {
            console.log('Direct ID provided:', formUrl);
            return formUrl;
        }

        let formId = null;

        // Handle various URL formats
        if (formUrl.includes('/forms/')) {
            // Handle edit URL format (e.g., /forms/d/[ID]/edit)
            if (formUrl.includes('/forms/d/')) {
                formId = formUrl.split('/forms/d/')[1].split('/')[0];
            }
            // Handle prefilled URL format (e.g., /forms/d/e/[ID]/viewform)
            else if (formUrl.includes('/forms/d/e/')) {
                formId = formUrl.split('/forms/d/e/')[1].split('/')[0];
            }
            // Handle prefilled response format (e.g., /forms/e/[ID]/viewform)
            else if (formUrl.includes('/forms/e/')) {
                formId = formUrl.split('/forms/e/')[1].split('/')[0];
            }
            // Handle short URL format (e.g., /forms/[ID])
            else {
                formId = formUrl.split('/forms/')[1].split('/')[0];
            }
        }
        // Handle shortened URL format (e.g., forms.gle/[ID])
        else if (formUrl.includes('forms.gle/')) {
            formId = formUrl.split('forms.gle/')[1].split('/')[0];
        }

        if (!formId) {
            throw new Error('Could not extract form ID from URL');
        }

        console.log('Extracted form ID:', formId);
        return formId;

    } catch (error) {
        console.error('Error extracting form ID:', error);
        return null;
    }
};

// Helper function to get or create linked spreadsheet
const getOrCreateSpreadsheet = async (formId, formTitle) => {
    try {
        const { forms, sheets } = await initialize();
        
        // First, try to get existing linked spreadsheet
        const formDetails = await forms.forms.get({ 
            formId,
            fields: 'linkedSheetId'
        });

        if (formDetails.data.linkedSheetId) {
            console.log('Found linked spreadsheet:', formDetails.data.linkedSheetId);
            return formDetails.data.linkedSheetId;
        }

        // If no linked sheet exists, create one
        console.log('No linked spreadsheet found. Creating new one...');
        const spreadsheet = await sheets.spreadsheets.create({
            requestBody: {
                properties: {
                    title: `${formTitle} - Responses`
                },
                sheets: [
                    {
                        properties: {
                            sheetId: 0, 
                            title: 'Form Responses 1', 
                            gridProperties: { 
                                rowCount: 1000, 
                                columnCount: 26 
                            }
                        }
                    }
                ]
            },
        });

        const spreadsheetId = spreadsheet.data.spreadsheetId;


        console.log('Created and linked new spreadsheet:', spreadsheetId);
        return spreadsheetId;
    } catch (error) {
        console.error('Error with spreadsheet:', error);
        throw error;
    }
};


// Function to record form submission
const recordFormSubmission = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        console.log('Processing form submission for:', { eventId, userId });

        // Get event and form details
        const event = await Event.findById(eventId);
        if (!event?.formId) {
            return res.status(400).json({ message: 'Event form not found' });
        }
        console.log('Event:', event);
        // Check registration   
        const registration = await Registration.findOne({ eventId, userId });
        if (!registration) {
            return res.status(400).json({ message: 'Not registered for this event' });
        }

        // Get user email
        const user = await User.findById(userId);
        if (!user?.email) {
            return res.status(400).json({ message: 'User email not found' });
        }

        // Extract form ID and get spreadsheet
        const formId = extractFormId(event.formId);
        if (!formId) {
            return res.status(400).json({ message: 'Invalid form link' });
        }

        try {
            // Initialize Google Sheets API
            const { sheets } = await initialize();
            
            // Get spreadsheet ID
            const spreadsheetId = await getOrCreateSpreadsheet(formId, event.title);
            
            // Get form responses
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: 'Form Responses 1'
            });

            const rows = response.data.values || [];
            if (rows.length <= 1) {
                return res.status(400).json({ 
                    message: 'No form submissions found. Please submit the form first.' 
                });
            }

            // Get headers and find email column index
            const headers = rows[0];
            const emailColumnIndex = headers.findIndex(header => 
                header.toLowerCase().includes('email')
            );

            if (emailColumnIndex === -1) {
                return res.status(400).json({ 
                    message: 'Email field not found in form responses' 
                });
            }

            console.log('Looking for email:', user.email);
            console.log('Available responses:', rows.length - 1);

            // Find user's response
            const userResponse = rows.slice(1).find(row => {
                const responseEmail = row[emailColumnIndex]?.toLowerCase().trim();
                const userEmail = user.email.toLowerCase().trim();
                console.log('Comparing:', responseEmail, 'with', userEmail);
                return responseEmail === userEmail;
            });

            if (!userResponse) {
                return res.status(400).json({ 
                    message: 'Your form submission was not found. Please submit the form using your registered email.' 
                });
            }

            // Convert response to object with headers as keys
            const formattedResponse = headers.reduce((obj, header, index) => {
                obj[header] = userResponse[index] || '';
                return obj;
            }, {});

            // Get timestamp from response (usually first column)
            const submissionTimestamp = new Date(userResponse[0]);

            // Record the submission with response data
            const submission = await FormSubmission.findOneAndUpdate(
                {
                    eventId,
                    userId,

                },
                {
                    $set: {
                        status: 'approved',
                        submittedAt: submissionTimestamp || new Date(),
                        formLink: event.formId,
                        verifiedAt: new Date(),
                        responses: formattedResponse, // Store the formatted response
                        registrationId: registration._id
                    }
                },
                { upsert: true, new: true }
            );

            console.log('Form submission recorded: ', submission._id);

            try{
                await generateAndEmailCertificate(submission._id);
                console.log('Certificate generation initiated for submission: ', submission._id);
            }catch(error){
                console.error('Error sending email:', error);
            }

            return res.json({
                message: 'Form submission verified and recorded',
                hasSubmittedForm: true,
                submittedAt: submissionTimestamp || new Date(),
                submissionId: submission._id,
                responses: formattedResponse // Return the response data
            });

        } catch (error) {
            console.error('Error checking form responses:', error);
            return res.status(500).json({ 
                message: 'Error verifying form submission',
                details: 'Could not access form responses. Please try again later.'
            });
        }

    } catch (error) {
        console.error('Error recording submission:', error);
        res.status(500).json({ 
            message: 'Error processing form submission',
            details: error.message 
        });
    }
};
// Function to get form analytics
const getFormAnalytics = async (req, res) => {
    try {
        const eventId = req.params.id;
        
        // Get event details
        const event = await Event.findById(eventId);
        if (!event?.formId) {
            return res.status(404).json({ message: 'Event form not found' });
        }

        // Extract form ID and get spreadsheet
        const formId = extractFormId(event.formId);
        const spreadsheetId = await getOrCreateSpreadsheet(formId, event.title);

        const { sheets } = await initialize();
        
        // Get all responses including headers
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: 'Form Responses 1'
        });

        const rows = response.data.values || [];
        if (rows.length <= 1) { // Only header row or empty
            return res.json({
                totalResponses: 0,
                responses: []
            });
        }

        // First row contains headers
        const headers = rows[0];
        const responses = rows.slice(1).map(row => {
            const response = {};
            headers.forEach((header, index) => {
                response[header] = row[index];
            });
            return response;
        });

        // Get basic analytics
        const analytics = {
            totalResponses: responses.length,
            responseRate: await calculateResponseRate(eventId, responses.length),
            questionSummaries: generateQuestionSummaries(headers, responses)
        };

        res.json(analytics);

    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ 
            message: 'Error fetching analytics',
            details: error.message 
        });
    }
};

// Helper function to calculate response rate
const calculateResponseRate = async (eventId, responseCount) => {
    const registrationCount = await Registration.countDocuments({ eventId });
    return registrationCount ? (responseCount / registrationCount) * 100 : 0;
};

// Helper function to generate question summaries
const generateQuestionSummaries = (headers, responses) => {
    const summaries = {};
    
    // Skip timestamp and email columns (usually first two)
    headers.slice(2).forEach((question, index) => {
        const answers = responses.map(r => r[question]).filter(Boolean);
        
        summaries[question] = {
            responseCount: answers.length,
            // For multiple choice questions, count frequencies
            frequencies: answers.reduce((acc, answer) => {
                acc[answer] = (acc[answer] || 0) + 1;
                return acc;
            }, {})
        };
    });

    return summaries;
};

// Function to export responses to CSV
const exportResponses = async (req, res) => {
    try {
        const eventId = req.params.id;
        
        const event = await Event.findById(eventId);
        if (!event?.formId) {
            return res.status(404).json({ message: 'Event form not found' });
        }

        const formId = extractFormId(event.formId);
        const spreadsheetId = await getOrCreateSpreadsheet(formId, event.title);

        const { sheets } = await initialize();
        
        // Get all responses
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: 'Form Responses 1'
        });

        const rows = response.data.values || [];
        if (rows.length <= 1) {
            return res.status(404).json({ message: 'No responses found' });
        }

        // Convert to CSV
        const csv = rows.map(row => row.join(',')).join('\n');

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${event.title}-responses.csv`);
        
        res.send(csv);

    } catch (error) {
        console.error('Error exporting responses:', error);
        res.status(500).json({ 
            message: 'Error exporting responses',
            details: error.message 
        });
    }
};

// Function to get form submission status
const getFormSubmissionStatus = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        const submission = await FormSubmission.findOne({ eventId, userId })
            .select('status submittedAt responses');

        if (!submission) {
            return res.status(404).json({ message: 'No form submission found' });
        }

        res.json({
            status: submission.status,
            submittedAt: submission.submittedAt,
            hasSubmittedForm: true
        });
    } catch (error) {
        console.error('Error getting form submission status:', error);
        res.status(500).json({ message: 'Error getting form submission status' });
    }
};

// Export all functions
module.exports = {
    recordFormSubmission,
    getFormAnalytics,
    exportResponses,
    getFormSubmissionStatus
};