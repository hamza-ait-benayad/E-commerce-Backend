import express from "express"
import { createProduct, deleteProduct, getAllProducts, getProductById, getProductBySlug } from "../../controllers/product.controller";
import { body } from "express-validator";


const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/slug/:slug', getProductBySlug);
router.post('/', createProduct);
// router.put('/:id', validateProduct, updateProduct);
router.delete('/:id', deleteProduct);

export default router;