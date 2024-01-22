import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
	{
		productName: {
			type: String,
			required: [true, "Product Name is required!!"],
			trim: true,
		},
		category: [
			{
				type: String,
				required: [true, "Product category is required!!"],
				trim: true,
			},
		],
		description: {
			type: String,
			required: [true, "Product description is required!!"],
			trim: true,
		},
		image: {
			type: String,
			required: [true, "Product image is required!!"],
			trim: true,
		},
		rating: {
			type: {
				average: { type: Number, default: 0 },
				count: { type: Number, default: 0 },
			},
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
