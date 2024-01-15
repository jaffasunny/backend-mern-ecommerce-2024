import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
	{
		cart: {
			type: Schema.Types.ObjectId,
			ref: "Cart",
			required: [true, "Cart is required!"],
		},
		status: {
			type: [
				{
					type: String,
					enum: ["pending", "shipped", "delivered"],
					default: "pending",
				},
			],
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
