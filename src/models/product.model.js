import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
	{
		productName: {
			type: String,
			required: [true, "Product Name is required!!"],
			trim: true,
		},
		sellerId: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		price: {
			type: Number,
			required: [true, "Price is required!!"],
			trim: true,
		},
		quantity: {
			type: Number,
			required: [true, "Quantity is required!!"],
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

export const Product = mongoose.model("Product", productSchema);
