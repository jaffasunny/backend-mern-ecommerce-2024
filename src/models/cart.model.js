import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User is required!"],
		},
		items: [
			{
				product: {
					type: Schema.Types.ObjectId,
					ref: "Product",
					required: [true, "Product is required!"],
				},
				quantity: {
					type: Number,
					required: [true, "Quantity is required!"],
					min: 1,
				},
			},
		],
		totalPrice: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

export const Cart = mongoose.model("Cart", cartSchema);
