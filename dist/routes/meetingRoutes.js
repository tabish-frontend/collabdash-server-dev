"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../middlewares");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
// PROTECTED ROUTES ONLY USE FOR HR
// router.use(Protect);
router.route("/").post(middlewares_1.Protect, controllers_1.createMeeting).get(middlewares_1.Protect, controllers_1.getAllMeetings);
router.route("/:id").get(controllers_1.getMeeting);
//   .patch(updateHoliday)
//   .delete(deleteHoliday)
exports.default = router;
//# sourceMappingURL=meetingRoutes.js.map