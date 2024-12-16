const express = require('express');
const formSubmissionRoutes = express.Router();
const authenticateJWT = require('../../middleware/auth');
const formSubmissionService = require('../../services/user/formSubmissionService');
const certificateService = require('../../services/user/certificateService');

formSubmissionRoutes.post('/u/events/:id/form-submission', authenticateJWT, formSubmissionService.recordFormSubmission);
formSubmissionRoutes.get('/u/events/:id/form-status', authenticateJWT, formSubmissionService.getFormSubmissionStatus);
formSubmissionRoutes.get('/u/events/:id/certificate-status', authenticateJWT, certificateService.checkCertificateStatus);

module.exports = formSubmissionRoutes;