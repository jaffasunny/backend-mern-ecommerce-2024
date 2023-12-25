import { Router } from "express";
import {
	addToCart,
	getCart,
	removeItemFromCart,
} from "../controllers/cart.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(authMiddleware, getCart).post(authMiddleware, addToCart);

router.route("/:id").delete(authMiddleware, removeItemFromCart);

export default router;
