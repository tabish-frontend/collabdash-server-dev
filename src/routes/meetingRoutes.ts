import { Router } from "express";
import { Protect } from "../middlewares";

import { createMeeting, getAllMeetings } from "../controllers";

const router = Router();

// PROTECTED ROUTES ONLY USE FOR HR

router.use(Protect);

router.route("/").post(createMeeting).get(getAllMeetings);

// router
//   .route("/:_id")
//   .patch(updateHoliday)
//   .delete(deleteHoliday)
//   .get(getUserHolidays);

export default router;
