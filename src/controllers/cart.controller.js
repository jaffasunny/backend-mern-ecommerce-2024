import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js";
import { calculateTotalPrice } from "../utils/totalPriceCalculator.js";

const getCart = asyncHandler(async (req, res) => {
	const { _id: userId } = req.user;

	const cart = await Cart.find({ user: userId }).populate("user items.product");

	if (!cart) {
		throw new ApiError(404, "You don't have a cart!");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, cart, "Cart successfully fetched!"));
});

const addToCart = asyncHandler(async (req, res) => {
	const { _id: userId } = req.user;
	const { product: productId, quantity } = req.body;
	console.log("🚀 ~ addToCart ~ quantity:", quantity);
	console.log("🚀 ~ addToCart ~ productId:", productId);

	let cart = await Cart.findOne({ user: userId });
	let product_item = await Product.findById(productId);

	if (product_item.quantity > quantity) {
		if (!cart) {
			// Create a new empty cart if the user has no existing one yet

			cart = await new Cart({
				user: userId,
				items: [{ product: productId, quantity }],
				totalPrice: 0,
			});
		} else {
			let itemExists = false;

			for (let index = 0; index < cart.items.length; index++) {
				if (cart.items[index].product.toString() === productId) {
					cart.items[index].quantity += quantity;
					itemExists = true;
					break;
				}
			}

			if (!itemExists) {
				cart.items.push({ product: productId, quantity });
			}
		}
		cart.totalPrice = await calculateTotalPrice(cart.items);

		await cart.save(); // Save the cart

		return res
			.status(200)
			.json(new ApiResponse(200, cart, "Products added to Cart successfully!"));
	} else {
		throw new ApiError(409, `${product_item.productName} is out of stock.`);
	}
});

const removeItemFromCart = asyncHandler(async (req, res) => {
	const { id: productId } = req.params;
	const { _id: userId } = req.user;

	let cart = await Cart.findOne({ user: userId }).populate(
		"user items.product"
	);

	if (!cart) {
		throw new ApiError(404, "No cart available!");
	}

	// check if cart contains the productId
	const itemIndex = cart.items.findIndex(
		(i) => i.product._id.toString() === productId
	);
	if (itemIndex < 0) {
		throw new ApiError(404, "Product is not in your cart!");
	}

	// if product is present then check if the product's quantity is greater than 0
	// start decreasing the quantity by 1 and once it becomes equal to 0
	// then pop the item from the product array

	if (cart.items[itemIndex].quantity > 1) {
		cart.items[itemIndex].quantity -= 1;
		cart.totalPrice -= cart.items[itemIndex].product.price;
	} else {
		cart.totalPrice -= cart.items[itemIndex].product.price;
		cart.items = cart.items.filter(
			(item) => item._id !== cart.items[itemIndex]._id
		);
	}

	cart.totalPrice = parseFloat(cart.totalPrice.toFixed(2)); // rounding off to two

	// save the cart now
	await cart.save();

	return res
		.status(200)
		.json(
			new ApiResponse(200, cart, "Products successfully removed from cart!")
		);
});

export { getCart, addToCart, removeItemFromCart };
