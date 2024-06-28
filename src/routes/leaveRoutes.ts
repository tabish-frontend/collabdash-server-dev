import { Router } from "express";
import { Protect, restrictTo } from "../middlewares";

import {
  addLeave,
  deleteLeave,
  getAllUserLeaves,
  getUserLeaves,
  updateLeave,
  updateLeaveStatus,
} from "../controllers";

const router = Router();

// PROTECTED ROUTES ONLY USE FOR HR

router.use(Protect);

router.route("/:leave_id").patch(updateLeave).delete(deleteLeave);

router.route("/:_id").get(getUserLeaves);

router.use(restrictTo("hr", "admin"));

router.route("/").get(getAllUserLeaves).post(addLeave);

router.put("/:leave_id/status/:status", updateLeaveStatus);

export default router;
