import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { feedBack } from '../controllers/report.controller.js';

const router = express.Router();


router.get('/gd/:id', protectRoute, feedBack)

export default router;