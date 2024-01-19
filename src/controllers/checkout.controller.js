import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const checkout = asyncHandler(async (req, res) => {
	const { product } = req.body;

	console.log({ product });

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		line_items: [
			{
				price_data: {
					currency: "usd",
					product_data: {
						name: product.name,
					},
					unit_amount: product.price * 100,
				},
				quantity: product.quantity,
			},
		],
		mode: "payment",
		success_url: "http://localhost:3000/success",
		cancel_url: "http://localhost:3000/cancel",
	});

	return res
		.status(200)
		.json(
			new ApiResponse(200, { id: session.id }, "Order successfully fetched!")
		);
});

export { checkout };
