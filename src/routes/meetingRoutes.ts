import { Router } from "express";
import { Protect } from "../middlewares";

import {
  createMeeting,
  deleteMeeting,
  getAllMeetings,
  getMeeting,
  updateMeeting,
} from "../controllers";

const router = Router();

router.route("/").post(Protect, createMeeting).get(Protect, getAllMeetings);

router
  .route("/:id")
  .get(getMeeting)
  .patch(Protect, updateMeeting)
  .delete(Protect, deleteMeeting);

export default router;
