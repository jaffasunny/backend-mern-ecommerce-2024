import { Router } from "express";
import { getOrders, createOrder } from "../controllers/order.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router
	.route("/")
	.get(authMiddleware, getOrders)
	.post(authMiddleware, createOrder);

export default router;
