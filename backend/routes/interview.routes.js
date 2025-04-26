import express from 'express';
import { groupDiscussion, evaluateResponse } from '../controllers/interview.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

// Generate a group discussion topic
router.get('/gd/topic', protectRoute, groupDiscussion);
// Evaluate a group discussion response
router.post('/gd/evaluate', protectRoute, evaluateResponse);



export default router;