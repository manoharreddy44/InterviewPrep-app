import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { updateUser } from '../controllers/user.controller.js';
import { deleteUser } from '../controllers/user.controller.js';

const router = express.Router();


router.post('/update/:id', protectRoute, updateUser);
router.delete('/delete/:id', protectRoute, deleteUser);

export default router;