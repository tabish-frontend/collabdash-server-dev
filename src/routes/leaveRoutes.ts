import { Router } from "express";
import { Protect, restrictTo } from "../middlewares";

import {
  addHoliday,
  addLeave,
  deleteHoliday,
  getAllUserHolidays,
  getAllUserLeaves,
  getUserHolidays,
  updateHoliday,
} from "../controllers";

const router = Router();

// PROTECTED ROUTES ONLY USE FOR HR

router.use(Protect);
router.use(restrictTo("hr", "admin"));

router.route("/").get(getAllUserLeaves).post(addLeave);

// router
//   .route("/:_id")
//   .patch(updateHoliday)
//   .delete(deleteHoliday)
//   .get(getUserHolidays);

export default router;
