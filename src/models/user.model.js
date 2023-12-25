import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError.js";

const userSchema = new Schema(
	{
		firstName: {
			type: String,
			required: [true, "First Name is required!!"],
			trim: true,
		},
		lastName: {
			type: String,
			required: [true, "Last Name is required!!"],
			trim: true,
		},
		username: {
			type: String,
			required: [true, "Username is required!!"],
			unique: [true, "Username must be unique!"],
			trim: true,
		},
		email: {
			type: String,
			required: [true, "Email is required!!"],
			unique: [true, "Email must be unique!"],
			trim: true,
		},
		// hashed and salted password
		password: {
			type: String,
			required: [true, "Password is required!!"],
		},
		address: {
			country: {
				type: String,
				required: [true, "Country is required!"],
				trim: true,
			},
			street: {
				type: String,
				required: [true, "Street is required!"],
				trim: true,
			},
			city: { type: String, required: [true, "City is required!"], trim: true },
			state: {
				type: String,
				required: [true, "State is required!"],
				trim: true,
			},
			zip: { type: String, required: [true, "Zip is required!"], trim: true },
		},
		shippingAddress: {
			street: {
				type: String,
				required: [true, "Street is required!"],
				trim: true,
			},
			city: { type: String, required: [true, "City is required!"], trim: true },
			state: {
				type: String,
				required: [true, "State is required!"],
				trim: true,
			},
			zip: { type: String, required: [true, "Zip is required!"], trim: true },
		},
		roles: {
			type: [
				{
					type: String,
					enum: ["customer", "seller"],
				},
			],
			default: ["customer"],
		},
	},
	{
		timestamps: true,
	}
);

userSchema.pre("save", async function (next) {
	try {
		const saltRounds = Number(process.env.SALT_ROUNDS) || 10;

		if (!this.isModified("password")) return next();

		this.password = await bcrypt.hash(this.password, saltRounds);

		next();
	} catch (error) {
		console.log("Error in user pre save", error);
		throw new ApiError(500, `User creation failed! ${error}`);
	}
});

export const User = mongoose.model("User", userSchema);
