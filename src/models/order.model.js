import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
	{
		cart: {
			type: Schema.Types.ObjectId,
			ref: "Cart",
			required: [true, "Cart is required!"],
		},
		status: {
			type: String,
			enum: ["pending", "payed", "shipped", "delivered"],
			default: "pending", // Define the default directly on the 'status' field
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User is required!"],
		},
	},
	{
		timestamps: true,
	}
);

export const Order = mongoose.model("Order", orderSchema);
