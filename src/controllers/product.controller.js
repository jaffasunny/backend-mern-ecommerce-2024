import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";

const getAllProducts = asyncHandler(async (req, res) => {
	const products = await Product.find().populate("sellerId");

	if (!products) {
		throw new ApiError(404, "No products available!");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, products, "Products successfully fetched!"));
});

const getSingleProduct = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const product = await Product.findById(id).populate("sellerId");

	if (!product) {
		throw new ApiError(404, "No such product available!");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, product, "Products successfully fetched!"));
});

const createSingleProduct = asyncHandler(async (req, res) => {
	const { productName, price, quantity, category, description, image, rating } =
		req.body;

	// extracting seller id from authentication middleware
	const { _id: sellerId } = req.user;

	const products = await Product.find({ productName });

	if (products.length) {
		throw new ApiError(404, "Product already exists!");
	}

	const product = await Product.create({
		productName,
		sellerId,
		price,
		quantity,
		category,
		description,
		image,
		rating,
	});

	const createdProduct = await Product.findById(product._id);

	if (!createdProduct) {
		throw new ApiError(500, "Something went wrong while creating product!");
	}

	return res
		.status(201)
		.json(
			new ApiResponse(200, createdProduct, "Product created successfully!")
		);
});

const updateProduct = asyncHandler(async (req, res) => {
	const {
		productName,
		sellerId,
		price,
		quantity,
		category,
		description,
		image,
		rating,
	} = req.body;
	const { id } = req.params;

	const products = await Product.findById(id);

	if (!products) {
		throw new ApiError(404, "Product doesn't exist!");
	}

	const updatedProduct = await Product.findByIdAndUpdate(
		id,
		{
			productName,
			sellerId,
			price,
			quantity,
			category,
			description,
			image,
			rating,
		},
		{ new: true, runValidators: true }
	);

	if (!updatedProduct) {
		throw new ApiError(500, "Something went wrong while creating product!");
	}

	return res
		.status(201)
		.json(
			new ApiResponse(200, updatedProduct, "Product updated successfully!")
		);
});

const removeProduct = asyncHandler(async (req, res) => {
	const {
		productName,
		sellerId,
		price,
		quantity,
		category,
		description,
		image,
		rating,
	} = req.body;
	const { id } = req.params;

	const products = await Product.findById(id);

	if (!products) {
		throw new ApiError(404, "Product doesn't exist!");
	}

	const deletedProduct = await Product.findByIdAndDelete(
		id,
		{
			productName,
			sellerId,
			price,
			quantity,
			category,
			description,
			image,
			rating,
		},
		{ runValidators: true }
	);

	if (!deletedProduct) {
		throw new ApiError(500, "Something went wrong while creating product!");
	}

	return res
		.status(201)
		.json(
			new ApiResponse(200, deletedProduct, "Product deleted successfully!")
		);
});

export {
	getAllProducts,
	createSingleProduct,
	updateProduct,
	removeProduct,
	getSingleProduct,
};
