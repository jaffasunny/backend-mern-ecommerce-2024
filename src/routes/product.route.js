import { Router } from "express";
import {
	createSingleProduct,
	getAllProducts,
	removeProduct,
	updateProduct,
	getSingleProduct,
} from "../controllers/product.controller.js";
import { authMiddleware, roleCheck } from "../middlewares/auth.middleware.js";

const router = Router();

router
	.route("/")
	.get(authMiddleware, getAllProducts)
	.post(authMiddleware, roleCheck("seller"), createSingleProduct);

router
	.route("/:id")
	.get(authMiddleware, getSingleProduct)
	.patch(authMiddleware, roleCheck("seller"), updateProduct)
	.delete(authMiddleware, roleCheck("seller"), removeProduct);

export default router;
