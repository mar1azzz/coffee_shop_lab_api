import { RequestHandler, Router } from "express";
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/productController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

router.get("/product", getAllProducts);
router.get("/product/:id", getProductById as RequestHandler);
router.post("/product", authenticate as RequestHandler, authorize(["ADMIN"]) as RequestHandler, createProduct as RequestHandler);
router.put("/product/:id", authenticate as RequestHandler, authorize(["ADMIN"]) as RequestHandler, updateProduct as RequestHandler);
router.delete("/product/:id", authenticate as RequestHandler, authorize(["ADMIN"]) as RequestHandler, deleteProduct as RequestHandler);

export default router;
