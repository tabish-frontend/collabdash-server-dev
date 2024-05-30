import { Router } from "express";
import { Protect, restrictTo } from "../middlewares";

import { addShift, updateShift } from "../controllers";

const router = Router();

// PROTECTED ROUTES ONLY USE FOR HR

router.use(Protect);

router.use(restrictTo("hr", "admin"));

router.route("/").post(addShift);

router.patch("/:shift_id", updateShift);

export default router;
