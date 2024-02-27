import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ResetPasswordToken } from "../models/resetPasswordToken.model.js";
import sendEmail from "../utils/sendMail.js";
import crypto from "crypto";

// Generate New Refresh Token and Access Token
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

// Signup
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

// Login
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

	user.refreshTokens.push({ token: refreshToken });

	// remove password from response
	delete user._doc.password;

	await user.save({ validateBeforeSave: false });

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

// Logout
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

// User Profile
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

// Refresh Access Token if access token expires
const refreshAccessToken = asyncHandler(async (req, res) => {
	const incomingRefreshToken =
		req.cookies.refreshToken || req.body.refreshToken;

	if (!incomingRefreshToken) {
		throw new ApiError(401, "Unauthorized request!");
	}

	try {
		const user = await User.findById(req.user._id);

		// 3. Find the specific refresh token in the user's collection:

		const matchingRefreshToken = user.refreshTokens.find(
			(token) => token.token === incomingRefreshToken
		);

		if (!matchingRefreshToken) {
			throw new ApiError(401, "Invalid Refresh Token!");
		}

		// 4. Revoke the used refresh token (optional for enhanced security):
		user.refreshTokens = user.refreshTokens.filter(
			(token) => token.token !== incomingRefreshToken
		);

		const options = {
			httpOnly: true,
			secure: true,
		};

		const { accessToken, refreshToken: newRefreshToken } =
			await generateAccessAndRefreshTokens(user._id);

		// 6. Add new refresh token to the user's collection:
		user.refreshTokens.push({ token: newRefreshToken });

		await user.save({ validateBeforeSave: false });

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

const sendResetPasswordToken = asyncHandler(async (req, res) => {
	const { email } = req.body;

	const user = await User.findOne({ email });
	if (!user) {
		throw new ApiError(400, "User with given email address doesnot exist!");
	}

	let token = await ResetPasswordToken.findOne({ userId: user._id });

	if (!token) {
		token = await new ResetPasswordToken({
			userId: user._id,
			token: crypto.randomBytes(32).toString("hex"),
		}).save();
	}

	const link = `${process.env.BASE_URL}/reset-password/${user._id}/${token.token}`;
	await sendEmail(user.email, "Password reset", link);

	return res
		.status(200)
		.json(
			new ApiResponse(200, "Reset password link sent to your email address!")
		);
});

const resetPassword = asyncHandler(async (req, res) => {
	const { userId, token: enteredToken } = req.params;
	const { password } = req.body;

	const user = await User.findById(userId);

	if (!user) {
		throw new ApiError(
			400,
			"Invalid Link or maybe your link has been expired!"
		);
	}

	let resetPasswordToken = await ResetPasswordToken.findOne({
		userId: user._id,
		token: enteredToken,
	});

	if (!resetPasswordToken) {
		throw new ApiError(
			400,
			"Invalid Link or maybe your link has been expired!"
		);
	}

	user.password = password;
	await user.save();
	await ResetPasswordToken.findOneAndDelete({
		token: enteredToken,
	});

	return res
		.status(200)
		.json(new ApiResponse(200, "Password Reset Successfully!"));
});

export {
	registerUser,
	loginUser,
	logoutUser,
	userProfile,
	refreshAccessToken,
	sendResetPasswordToken,
	resetPassword,
};
