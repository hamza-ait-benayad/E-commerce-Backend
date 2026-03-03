import { Router } from 'express';
import { getCart, addToCart } from '../../controllers/cart.controller';
import { optionalAuthenticate } from '../../middleware/auth.middleware';
import { cartSessionMiddleware } from '../../middleware/cartSession.middleware';

const router = Router();

router.use(optionalAuthenticate);
router.use(cartSessionMiddleware);

router.get('/', getCart);
router.post('/', addToCart);

export default router;
