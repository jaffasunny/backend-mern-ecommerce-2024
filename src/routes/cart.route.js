import { Router } from "express";
import {
	addToCart,
	getCart,
	removeItemFromCart,
	clearCart,
	completlyRemoveItem,
} from "../controllers/cart.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(authMiddleware, getCart).post(authMiddleware, addToCart);

router.route("/:id").delete(authMiddleware, removeItemFromCart);

router.route("/clearCart").get(authMiddleware, clearCart);
router
	.route("/removeItem/:id/:itemId")
	.get(authMiddleware, completlyRemoveItem);

export default router;
