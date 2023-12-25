import { Product } from "../models/product.model.js";
import { ApiError } from "./ApiError.js";

export const calculateTotalPrice = async (items) => {
	try {
		let totalPrice = 0;

		for (let index = 0; index < items.length; index++) {
			const product = await Product.findById(items[index].product.toString());

			if (!product) {
				throw new ApiError(
					404,
					"Total Price cannot be calculated, because Product not found"
				);
			} else {
				totalPrice += product.price * items[index].quantity;
			}
		}

		return totalPrice;
	} catch (error) {
		console.log({ error });
	}
};
