import { Router } from "express";
import {
	getOrders,
	createOrder,
	changeOrderStatus,
	clearPendingOrder,
} from "../controllers/order.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router
	.route("/")
	.get(authMiddleware, getOrders)
	.post(authMiddleware, createOrder);

router.route("/changeOrderStatus").patch(authMiddleware, changeOrderStatus);
router.route("/clearPendingOrder").get(authMiddleware, clearPendingOrder);

export default router;
