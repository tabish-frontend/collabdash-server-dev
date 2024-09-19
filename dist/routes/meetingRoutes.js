"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../middlewares");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
// PROTECTED ROUTES ONLY USE FOR HR
router.use(middlewares_1.Protect);
router.route("/").post(controllers_1.createMeeting).get(controllers_1.getAllMeetings);
// router
//   .route("/:_id")
//   .patch(updateHoliday)
//   .delete(deleteHoliday)
//   .get(getUserHolidays);
exports.default = router;
//# sourceMappingURL=meetingRoutes.js.map