import { Router } from "express";
import {
	createSingleProduct,
	getAllProducts,
	removeProduct,
	updateProduct,
} from "../controllers/product.controller.js";
import { authMiddleware, roleCheck } from "../middlewares/auth.middleware.js";

const router = Router();

router
	.route("/")
	.get(authMiddleware, getAllProducts)
	.post(authMiddleware, roleCheck("seller"), createSingleProduct);

router
	.route("/:id")
	.patch(authMiddleware, roleCheck("seller"), updateProduct)
	.delete(authMiddleware, roleCheck("seller"), removeProduct);

export default router;
