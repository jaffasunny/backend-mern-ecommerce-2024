import { Router } from "express";

const router = Router();

router.route("/").get((req, res) => {
	return res
		.status(200)
		.send(
			"<h1>Welcome to intial route for Backend Mern Ecommerce 2024....</h1>"
		);
});

export default router;
