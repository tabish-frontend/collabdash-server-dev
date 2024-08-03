import { Router } from "express";
import { Protect, restrictTo } from "../../middlewares";

import { addWorkspace, getAllWorkspaces } from "../../controllers";

const router = Router();

// PROTECTED ROUTES ONLY USE FOR HR

router.use(Protect);

router.use(restrictTo("hr", "admin"));

router.route("/").get(getAllWorkspaces).post(addWorkspace);

export default router;
