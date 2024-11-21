const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const FormSubmission = require('../../models/formSubmission');
const Event = require('../../models/event');
const User = require('../../models/user');
const Certificate = require('../../models/certificate');
const sendEmail = require('../../utils/sendEmail');

const generateAndEmailCertificate = async (submissionId) => {
    let outputPath = null;
    try {
        const submission = await FormSubmission.findById(submissionId)
            .populate('userId')
            .populate('eventId');

        if (!submission) {
            throw new Error('Form submission not found');
        }

        const { userId: user, eventId: event } = submission;

        // Check if certificate template exists
        if (!event.certificateTemplate) {
            throw new Error('Certificate template not found');
        }

        const templatePath = path.join(__dirname, '../../uploads/certificateTemplates', event.certificateTemplate);
        console.log('Template path:', templatePath);
        
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Certificate template file not found at: ${templatePath}`);
        }

        const certificatesDir = path.join(__dirname, '../../uploads/certificates');
        if (!fs.existsSync(certificatesDir)) {
            fs.mkdirSync(certificatesDir, { recursive: true });
        }

        // Format date to "Month DD, YYYY"
        const formatDate = (date) => {
            return date.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        };

        const fileName = `cert-${Date.now()}.pdf`;
        outputPath = path.join(certificatesDir, fileName);

        if(!fs.existsSync(outputPath)) {
            console.error('Output path does not exist:', outputPath);   
        }

        // Load and modify the PDF template
        const templateBytes = fs.readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(templateBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        // Embed fonts
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);  // Use HelveticaBold as a fallback

        // Find and replace placeholders
        const replacements = [
            {
                placeholder: '[ Name ]',
                value: user.name,
                x: width * 0.5,  // Center horizontally
                y: height * 0.6, // Position from top
                fontSize: 30,
                color: rgb(0, 0, 1), // Blue
                align: 'center'
            },
            {
                placeholder: '[eventName]',
                value: event.title,
                x: width * 0.5,  // Center horizontally
                y: height * 0.45, // Position from top
                fontSize: 24,
                color: rgb(0, 0, 0),
                align: 'center'
            },
            {
                placeholder: '[date]',
                value: formatDate(new Date()),
                x: width * 0.5,  // Center horizontally
                y: height * 0.35, // Position from top
                fontSize: 20,
                color: rgb(0, 0, 0),
                align: 'center'
            }
        ];

        // Add text for each replacement
        for (const replacement of replacements) {
            const textWidth = font.widthOfTextAtSize(replacement.value, replacement.fontSize);
            const xPosition = replacement.align === 'center' 
                ? replacement.x - (textWidth / 2) 
                : replacement.x;

            firstPage.drawText(replacement.value, {
                x: xPosition,
                y: replacement.y,
                size: replacement.fontSize,
                font: font,
                color: replacement.color
            });
        }

        // Save the modified PDF
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, pdfBytes);

        console.log('Saving certificate to:', outputPath);
        fs.writeFileSync(outputPath, pdfBytes);

        if (fs.existsSync(outputPath)) {
            console.log('Certificate saved successfully:', outputPath);
        } else {
            console.error('Failed to save certificate at:', outputPath);
            throw new Error('PDF generation failed');
        }

        // Store certificate in database
        const certificate = await Certificate.create({
            userId: user._id,
            eventId: event._id,
            submissionId: submission._id,
            fileName: fileName,
            issuedDate: new Date(),
            status: 'issued'
        });

        // Prepare and send email
        const emailContent = `
Dear ${user.name},

Congratulations on completing ${event.title}!

Your certificate of completion has been generated and is attached to this email. You can also access your certificate through your BukSU Engage profile at any time.

Event Details:
- Event: ${event.title}
- Completion Date: ${formatDate(new Date(submission.submittedAt))}

To view all your certificates:
1. Log in to BukSU Engage
2. Navigate to your profile
3. Click on the "Certificates" section

Best regards,
BukSU Engage Team
        `;

        if (!fs.existsSync(outputPath)) {
            console.error('Certificate file does not exist at:', outputPath);
            throw new Error('Cannot attach certificate, file not found');
        }
        
        try {
            await sendEmail(
                user.email,
                `Certificate of Completion - ${event.title}`,
                emailContent,
                {
                    accessToken: process.env.GMAIL_ACCESS_TOKEN,
                    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
                    attachments: [{
                        filename: fileName,
                        path: outputPath,
                        contentType: 'application/pdf'
                    }]
                }
            );
            console.log('Certificate email sent successfully to:', user.email);
        } catch (emailError) {
            console.error('Error sending certificate email:', emailError);
        }

        await FormSubmission.findByIdAndUpdate(submissionId, {
            certificateGenerated: true
        });

        return {
            certificateId: certificate._id,
            fileName: fileName // Changed from filePath
        };

    } catch (error) {
        console.error('Error in generateAndEmailCertificate:', error);
        if (outputPath && fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
        throw error;
    }
};

// Get user's certificates
const getUserCertificates = async (req, res) => {
    try {
        const userId = req.user.id;

        const certificates = await Certificate.find({ userId })
            .populate('eventId', 'title startTime')
            .sort({ issuedDate: -1 });

        res.json(certificates);
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({ message: 'Error fetching certificates' });
    }
};

const checkCertificateStatus = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        const certificate = await Certificate.findOne({ 
            eventId, 
            userId,
            status: 'issued'
        });

        res.json({
            status: certificate ? 'generated' : 'pending'
        });
    } catch (error) {
        console.error('Error checking certificate status:', error);
        res.status(500).json({ message: 'Error checking certificate status' });
    }
};

// Download specific certificate
const downloadCertificate = async (req, res) => {
    try {
        const certificateId = req.params.id;
        const userId = req.user.id;

        const certificate = await Certificate.findOne({
            _id: certificateId,
            userId
        });

        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        res.download(certificate.filePath);
    } catch (error) {
        console.error('Error downloading certificate:', error);
        res.status(500).json({ message: 'Error downloading certificate' });
    }
};

module.exports = {
    generateAndEmailCertificate,
    getUserCertificates,
    downloadCertificate,
    checkCertificateStatus
};
