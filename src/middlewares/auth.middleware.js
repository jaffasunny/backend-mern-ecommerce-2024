import jwt from "jsonwebtoken";
import { User } from "./../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
	try {
		const token = req.header("Authorization").replace("Bearer ", "");
		const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
		const user = await User.findById(decoded._id);

		if (!user) {
			throw new ApiError(404, "User not found");
		}

		req.user = user;
		req.token = token;
		next();
	} catch (error) {
		throw new ApiError(401, "Please Authenticate!");
	}
});

const roleCheck = (role) => {
	return (req, res, next) => {
		if (!req.user.roles.includes(role)) {
			return res
				.status(403)
				.json(new ApiResponse(403, "Access denied, Incorrect role!"));
		}
		next();
	};
};

export { authMiddleware, roleCheck };
