import { Router } from "express";
import { Protect } from "../middlewares";

import { createMeeting, getAllMeetings, getMeeting } from "../controllers";

const router = Router();

// PROTECTED ROUTES ONLY USE FOR HR

// router.use(Protect);

router.route("/").post(Protect, createMeeting).get(Protect, getAllMeetings);

router.route("/:id").get(getMeeting);
//   .patch(updateHoliday)
//   .delete(deleteHoliday)

export default router;
