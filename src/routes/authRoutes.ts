import express, { RequestHandler } from "express";
import { register } from "../controllers/register";
import { login } from "../controllers/login";

const router = express.Router();

router.post("/register", register as RequestHandler);
router.post("/login", login);

export default router;
