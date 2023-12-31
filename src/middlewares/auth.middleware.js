import jwt from "jsonwebtoken";
import { User } from "./../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// in production code 
// if we are not using any keys like for example
// (req,res,next)
// if i'm not using res key then we'll simply do smth like this
// (req,_,next)
const authMiddleware = asyncHandler(async (req, _, next) => {
	try {
		const token =
			req.cookies?.accessToken ||
			req.header("Authorization").replace("Bearer ", "");

		if (!token) {
			throw new ApiError(401, "Unauthorized request");
		}

		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		const user = await User.findById(decoded?._id).select(
			"-password -refreshToken"
		);

		if (!user) {
			throw new ApiError(404, "User not found");
		}

		req.user = user;
		next();
	} catch (error) {
		throw new ApiError(401, error?.message || "Please Authenticate!");
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
