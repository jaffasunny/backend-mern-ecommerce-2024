import { Router } from "express";
import { checkout } from "../controllers/checkout.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(authMiddleware, checkout);

export default router;
