import express from 'express';
import { signUp, signIn, logout, getMe, getUserById } from '../controllers/userController.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', signIn);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.get('/user/:id', getUserById);

export default router;
