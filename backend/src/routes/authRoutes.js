import { Router } from 'express';
import { signup, login, getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { signupValidator, loginValidator } from '../validators/authValidators.js';

const router = Router();

router.post('/signup', signupValidator, validate, signup);
router.post('/login', loginValidator, validate, login);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);

export default router;
