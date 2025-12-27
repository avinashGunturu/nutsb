import express from 'express';
import { validateCart } from '../controllers/cartController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart operations
 */

router.post('/validate', validateCart);

export default router;
