import { Router } from "express";
import { Protect, restrictTo } from "../../middlewares";

import { addBoard } from "../../controllers";

const router = Router();

// PROTECTED ROUTES ONLY USE FOR HR

router.use(Protect);

router.use(restrictTo("hr", "admin"));

router.route("/").post(addBoard);

export default router;
