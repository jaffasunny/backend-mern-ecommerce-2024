import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
	try {
		const user = await User.findById(userId);
		const accessToken = await user.generateAccessToken();
		const refreshToken = await user.generateRefreshToken();

		user.refreshToken = refreshToken;
		await user.save({ validateBeforeSave: false });

		return { accessToken, refreshToken };
	} catch (error) {
		throw new ApiError(
			500,
			"Something went wrong while generating refresh and access token!"
		);
	}
};

const registerUser = asyncHandler(async (req, res) => {
	const { firstName, lastName, username, email, password, roles } = req.body;

	if (!firstName || !lastName || !username || !email || !password) {
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
		roles,
	});

	const createdUser = await User.findById(user._id).select(
		"-password -refreshToken"
	);

	if (!createdUser) {
		throw new ApiError(500, "Something went wrong while registering the user!");
	}

	return res
		.status(201)
		.json(new ApiResponse(200, createdUser, "User registered Successfully!"));
});

const loginUser = asyncHandler(async (req, res) => {
	const { emailOrUsername, password } = req.body;

	if (!emailOrUsername || !password) {
		throw new ApiError(400, "Please fill all details!");
	}

	const user = await User.findOne({
		$or: [{ username: emailOrUsername }, { email: emailOrUsername }],
	});

	// compare password with hashed password
	// const matched = await bcrypt.compare(password, user.password);
	const matched = await user.isPasswordCorrect(password);

	if (!user) {
		throw new ApiError(401, `User doesnot exist!`);
	}

	if (!matched) {
		throw new ApiError(401, `Invalid user credentials!`);
	}

	// const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);

	const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
		user._id
	);

	// remove password from response
	delete user._doc.password;
	delete user._doc.refreshToken;

	const options = {
		httpOnly: true,
		secure: true,
	};

	return res
		.status(200)
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", refreshToken, options)
		.json(
			new ApiResponse(
				200,
				{ user, accessToken, refreshToken },
				"Login Successful!"
			)
		);
});

const logoutUser = asyncHandler(async (req, res) => {
	await User.findByIdAndUpdate(
		req.user._id,
		{
			$set: { refreshToken: undefined },
		},
		{
			new: true,
		}
	);

	const options = {
		httpOnly: true,
		secure: true,
	};

	return res
		.status(200)
		.clearCookie("accessToken", options)
		.cookie("refreshToken", options)
		.json(new ApiResponse(200, {}, "User logged out successfully!"));
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

const refreshAccessToken = asyncHandler(async (req, res) => {
	const incomingRefreshToken =
		req.cookies.refreshToken || req.body.refreshToken;

	if (!incomingRefreshToken) {
		throw new ApiError(401, "Unauthorized request!");
	}

	try {
		const decodedToken = jwt.verify(
			incomingRefreshToken,
			process.env.REFRESH_TOKEN_SECRET
		);

		const user = await User.findById(decodedToken?._id);

		if (!user) {
			throw new ApiError(401, "Invalid Refresh Token!");
		}

		if (incomingRefreshToken !== user?.refreshToken) {
			throw new ApiError(401, "Refresh token is expired or is being used!");
		}

		const options = {
			httpOnly: true,
			secure: true,
		};

		const { accessToken, newRefreshToken } =
			await generateAccessAndRefreshTokens(user._id);

		return res
			.status(200)
			.cookie("accessToken", accessToken, options)
			.cookie("refreshToken", newRefreshToken, options)
			.json(
				new ApiResponse(
					200,
					{ accessToken, refreshToken: newRefreshToken },
					"Access token refreshed successfully!"
				)
			);
	} catch (error) {
		throw new ApiError(401, error?.message || "Invalid Refresh Token!");
	}
});

export { registerUser, loginUser, logoutUser, userProfile, refreshAccessToken };
