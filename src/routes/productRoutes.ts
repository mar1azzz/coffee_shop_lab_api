import { RequestHandler, Router } from "express";
import { getAllProducts, createProduct, updateProduct, deleteProduct } from "../controllers/productController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

router.get("/product", getAllProducts);
router.post("/product", authenticate as RequestHandler, authorize(["ADMIN"]) as RequestHandler, createProduct);
router.put("/product/:id", authenticate as RequestHandler, authorize(["ADMIN"]) as RequestHandler, updateProduct as RequestHandler);
router.delete("/product/:id", authenticate as RequestHandler, authorize(["ADMIN"]) as RequestHandler, deleteProduct as RequestHandler);

export default router;
