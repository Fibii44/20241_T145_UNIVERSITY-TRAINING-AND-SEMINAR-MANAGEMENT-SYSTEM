const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { emitNewActivity } = require('../../config/socketConfig')
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

        // Create a new PDF document
        const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 50,
        });

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Add Background (Optional)
        const backgroundImage = 'uploads/certificateTemplates/BukSU-Logo-Background.png';
        doc.image(backgroundImage, 0, 0, { width: doc.page.width, height: doc.page.height });

        // Title: "Certificate of Completion"
        doc
        .moveDown(4)
        .fontSize(40)
        .font('Helvetica-Bold')
        .fillColor('#000')
        .text('Certificate of Completion', { align: 'center', baseline: 'top' });

        // Subtitle: "This is to certify that"
        doc
        .moveDown(0.5)
        .fontSize(19)
        .font('Helvetica')
        .text('This is to certify that', { align: 'center' });

        const nameWidth = doc.widthOfString(user.name, {fontSize: 40, font: 'Helvetica-Bold'});
        const xCenter = (doc.page.width - nameWidth) / 2;

        // User's Name
        doc
        .moveDown(1.5)
        .fontSize(45)
        .font('Helvetica-Bold')
        .fillColor('#000')
        .text(user.name, { align: 'center' });

        doc.moveDown(0.2);
        doc.moveTo(xCenter, doc.y).lineTo(xCenter + nameWidth, doc.y).stroke('#000');

        // Description: "has successfully completed the event"
        doc
        .moveDown(1)
        .fontSize(15)
        .font('Helvetica')
        .fillColor('#000')
        .text(`has successfully completed the event ${event.title}`, { align: 'center' });


        // Date of Completion
        const formattedDate = `which was conducted on ${formatDate(new Date(event.eventDate))}`;
        doc
        .moveDown(0.5)
        .fontSize(15)
        .font('Helvetica')
        .fillColor('#000')
        .text(formattedDate, { align: 'center' });

        // Footer or Additional Notes (Optional)
        doc
          .moveDown(4)
          .fontSize(10)
          .text('This is an official document issued by BukSU Engage.', { align: 'bottom-left' });
        doc
          .moveUp(1)
          .fontSize(10)
          .text(`© ${new Date().getFullYear()} Bukidnon State University. All rights reserved.`, { align: 'right' });

        doc.end();

        // Wait for the stream to finish before proceeding
        await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
        });

    console.log('Certificate saved successfully:', outputPath);

        // Store certificate in database
        const certificate = await Certificate.create({
            userId: user._id,
            eventId: event._id,
            submissionId: submission._id,
            fileName: fileName,
            issuedDate: new Date(),
            status: 'generated',
        });
    
    const admin = await User.findOne({email: process.env.GMAIL_USER})
    console.log('admin: ', admin);
        // Prepare and send email
        const emailContent = `
Dear ${user.name},

Congratulations on completing ${event.title}!

Your certificate of completion has been generated and is attached to this email. You can also access your certificate through your BukSU Engage profile at any time.

Event Details:
- Event: ${event.title}
- Completion Date: ${formatDate(new Date(submission.submittedAt))}

Best regards,
BukSU Engage Team
        `;

        try {
            await sendEmail(
                user.email,
                `Certificate of Completion - ${event.title}`,
                emailContent,
                {   
                    accessToken: admin.accessToken,
                    refreshToken: admin.refreshToken,
                    attachments: [
                        {
                            filename: fileName,
                            path: outputPath,
                            contentType: 'application/pdf',
                        },
                    ],
                }
            );
            console.log('Certificate email sent successfully to:', user.email);
        } catch (emailError) {
            console.error('Error sending certificate email:', emailError);
        }

        await FormSubmission.findByIdAndUpdate(submissionId, {
            certificateGenerated: true,
        });

        await emitNewActivity(user.id, 'Generated Certificate and Sent Email', { eventId: event._id, eventTitle: event.title });

        return {
            certificateId: certificate._id,
            fileName: fileName,
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
        });

        res.json({certificate});
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
