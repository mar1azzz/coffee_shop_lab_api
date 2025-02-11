import { RequestHandler, Router } from "express";
import  {
    getAllCategories,
    getCategoryById, 
    createCategory, 
    updateCategory } from "../controllers/categoryController"
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

router.get("/categories", getAllCategories);
router.get("/categories/:id", getCategoryById as RequestHandler);
router.post("/categories", authenticate as RequestHandler, authorize(["ADMIN"]) as RequestHandler, createCategory);
router.put("/categories/:id", authenticate as RequestHandler, authorize(["ADMIN"]) as RequestHandler, updateCategory);

export default router;
