import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { getInterviewByType } from '../controllers/report.controller.js';

const router = express.Router();

// Get specific interview by ID
router.post('/', protectRoute, getInterviewByType);

export default router;