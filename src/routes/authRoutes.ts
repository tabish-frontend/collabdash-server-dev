import express from "express";

// import { Protect } from "../middlewares/authMiddlewares.js";
import { generatePassword } from "../middlewares/generateRandomPasswordMiddleware";

import { login, signup } from "../controllers/authController";

const router = express.Router();

// router.route("/refresh-token").post(refreshAccessToken);

router.post("/signup", generatePassword, signup);

router.post("/login", login);

// router.post("/forgotPassword", forgotPassword);
// router.patch("/resetPassword/:token", refreshAccessToken);

//PROTECTED ROUTES

// router.use(Protect);
// router.post("/logout", logoutUser);
// router.patch("/updateMyPassword", updateMyPassword);

export default router;
