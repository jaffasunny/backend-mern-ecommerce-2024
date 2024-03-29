import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Cart } from "../models/cart.model.js";
import { Order } from "../models/order.model.js";

const getOrders = asyncHandler(async (req, res) => {
	const { _id: userId } = req.user;

	const order = await Order.find({ user: userId })
		.populate("cart user")
		.populate({
			path: "cart",
			populate: {
				path: "items.product",
				model: "Product",
			},
		});

	if (!order) {
		throw new ApiError(404, "You don't have any orders!");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, order, "Order successfully fetched!"));
});

const createOrder = asyncHandler(async (req, res) => {
	const { _id: userId } = req.user;
	const { cart } = req.body;

	let _cart = await Cart.findOne({ user: userId, _id: cart });

	if (!_cart) {
		throw new ApiError(400, `No items found in cart!`);
	}

	let order = new Order({
		cart,
		user: userId,
	});

	await order.save(); // Save Order

	return res
		.status(200)
		.json(new ApiResponse(200, order, "Order created successfully!"));
});

const changeOrderStatus = asyncHandler(async (req, res) => {
	const { orderId, status } = req.body;

	let order = await Order.findByIdAndUpdate(orderId, {
		status,
	});

	return res
		.status(200)
		.json(new ApiResponse(200, order, "Order status updated successfully!"));
});

const clearPendingOrder = asyncHandler(async (req, res) => {
	const { _id: userId } = req.user;

	let order = await Order.deleteMany({
		user: userId,
		status: "pending",
	});

	return res
		.status(200)
		.json(new ApiResponse(200, order, "Cleared pending orders successfully!"));
});

export { getOrders, createOrder, changeOrderStatus, clearPendingOrder };
