import { RequestHandler, Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { createOrder, getOrders, updateOrder, deleteOrder  } from "../controllers/orderController";

const router = Router();

router.post("/", authenticate as RequestHandler, createOrder as RequestHandler);
router.get("/", authenticate as RequestHandler, getOrders as RequestHandler);
router.put("/:orderId", authenticate as RequestHandler, updateOrder as RequestHandler);
router.delete("/:orderId", authenticate as RequestHandler, deleteOrder as RequestHandler);

export default router;
