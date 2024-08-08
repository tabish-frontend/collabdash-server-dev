import { Router } from "express";
import { Protect, restrictTo } from "../../middlewares";

import {
  addWorkspace,
  deleteWorkSpace,
  getAllWorkspaces,
  updateWorkspace,
} from "../../controllers";

const router = Router();

// PROTECTED ROUTES ONLY USE FOR HR

router.use(Protect);

router.use(restrictTo("hr", "admin"));

router.route("/").get(getAllWorkspaces).post(addWorkspace);

router.route("/:id").patch(updateWorkspace).delete(deleteWorkSpace);

export default router;
