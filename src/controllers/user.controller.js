import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
	const {
		firstName,
		lastName,
		username,
		email,
		password,
		address,
		shippingAddress,
		roles,
	} = req.body;

	if (
		!firstName ||
		!lastName ||
		!username ||
		!email ||
		!password ||
		!address ||
		!shippingAddress
	) {
		throw new ApiError(400, "Please fill all details!");
	}

	const existedUser = await User.findOne({ $or: [{ username }, { email }] });

	if (existedUser) {
		throw new ApiError(409, `Username or Email has already been used.`);
	}

	const user = await User.create({
		firstName,
		lastName,
		username: username.toLowerCase(),
		email,
		password,
		address,
		shippingAddress,
		roles,
	});

	const createdUser = await User.findById(user._id).select("-password");

	if (!createdUser) {
		throw new ApiError(500, "Something went wrong while registering the user!");
	}

	return res
		.status(201)
		.json(new ApiResponse(200, createdUser, "User registered Successfully!"));
});

const loginUser = asyncHandler(async (req, res) => {
	const { username, email, password } = req.body;

	if ((!username && !email) || !password) {
		throw new ApiError(400, "Please fill all details!");
	}

	const user = await User.findOne({ $or: [{ username }, { email }] });

	// compare password with hashed password
	const matched = await bcrypt.compare(password, user.password);

	if (!user || !matched) {
		throw new ApiError(401, `Login Failed!`);
	}

	const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);

	// remvoe password from response
	delete user._doc.password;

	return res
		.status(200)
		.json(new ApiResponse(200, { user, token }, "Login Successful!"));
});

const userProfile = asyncHandler(async (req, res) => {
	const { username } = req.user;

	const user = await User.findOne({ username }).select("-password");

	if (!user) {
		throw new ApiError(404, `User not found!`);
	}

	return res
		.status(200)
		.json(new ApiResponse(200, user, "User profile fetched successfully!"));
});

export { registerUser, loginUser, userProfile };
