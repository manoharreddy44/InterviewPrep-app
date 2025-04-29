import express from 'express';
import { groupDiscussion, evaluateResponse, generateTechnicalQuestion, submitTechnicalResponse, evaluateTechnicalResponse, generateHrQuestion, submitHrResponse, evaluateHrResponse, deleteInterview } from '../controllers/interview.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

// Generate a group discussion topic
router.get('/gd/topic', protectRoute, groupDiscussion);
// Evaluate a group discussion response
router.post('/gd/evaluate', protectRoute, evaluateResponse);

router.post('/technical/question', protectRoute, generateTechnicalQuestion);
router.post('/technical/submit', protectRoute, submitTechnicalResponse);
router.post('/technical/evaluate', protectRoute, evaluateTechnicalResponse);

// HR round routes
router.post('/hr/question', protectRoute, generateHrQuestion);
router.post('/hr/submit', protectRoute, submitHrResponse);
router.post('/hr/evaluate', protectRoute, evaluateHrResponse);

// Add this route for deleting an interview
router.delete('/:id', protectRoute, deleteInterview);

export default router;