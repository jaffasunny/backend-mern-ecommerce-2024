import mongoose, { Schema } from "mongoose";

const resetPasswordTokenSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User is required!"],
		},
		token: {
			type: String,
			required: [true, "Reset Password Token is required!"],
		},
	},
	{
		timestamps: true,
	}
);

export const ResetPasswordToken = mongoose.model(
	"ResetPasswordToken",
	resetPasswordTokenSchema
);
