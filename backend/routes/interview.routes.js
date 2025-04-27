import express from 'express';
import { groupDiscussion, evaluateResponse, generateTechnicalQuestion, submitTechnicalResponse, evaluateTechnicalResponse} from '../controllers/interview.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

// Generate a group discussion topic
router.get('/gd/topic', protectRoute, groupDiscussion);
// Evaluate a group discussion response
router.post('/gd/evaluate', protectRoute, evaluateResponse);

router.post('/technical/question', protectRoute, generateTechnicalQuestion);
router.post('/technical/submit', protectRoute, submitTechnicalResponse);
router.post('/technical/evaluate', protectRoute, evaluateTechnicalResponse);


export default router;