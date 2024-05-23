import express from "express";

import {
  forgotPassword,
  login,
  resetPassword,
  signup,
  updateMyPassword,
} from "../controllers";
import { Protect, generatePassword } from "../middlewares";

const router = express.Router();

router.post("/signup", generatePassword, signup);

router.post("/login", login);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

//PROTECTED ROUTES
router.patch("/updateMyPassword", Protect, updateMyPassword);

export default router;
