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

router
  .route("/")
  .get(getAllWorkspaces)
  .post(restrictTo("hr", "admin"), addWorkspace);

router.use(restrictTo("hr", "admin"));

router.route("/:id").patch(updateWorkspace).delete(deleteWorkSpace);

export default router;

// router.route("/").get(getAllWorkspaces);

// router.use(restrictTo("hr", "admin"));

// router.route("/").post(addWorkspace);
