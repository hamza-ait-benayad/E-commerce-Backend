import { Router } from 'express';

import authRoutes from './auth.routes';
import productRoutes from './product.routes'

// import userRoutes from './user.routes';

// import categoryRoutes from './category.routes';

// import cartRoutes from './cart.routes';

// import orderRoutes from './order.routes';

// import paymentRoutes from './payment.routes';

// import adminRoutes from './admin.routes';

  

const router = Router();

  

// Public routes

router.use('/auth', authRoutes);

router.use('/products', productRoutes);

// router.use('/categories', categoryRoutes);

  

// Protected routes (require authentication)

// router.use('/users', userRoutes);

// router.use('/cart', cartRoutes);

// router.use('/orders', orderRoutes);

// router.use('/payments', paymentRoutes);

  

// Admin routes

// router.use('/admin', adminRoutes);

  

export default router;
