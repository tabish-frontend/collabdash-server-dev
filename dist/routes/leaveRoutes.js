"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../middlewares");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
// PROTECTED ROUTES ONLY USE FOR HR
router.use(middlewares_1.Protect);
router.route("/:leave_id").patch(controllers_1.updateLeave).delete(controllers_1.deleteLeave);
router.route("/:_id").get(controllers_1.getUserLeaves);
router.use((0, middlewares_1.restrictTo)("hr", "admin"));
router.route("/").get(controllers_1.getAllUserLeaves).post(controllers_1.addLeave);
router.put("/:leave_id/status/:status", controllers_1.updateLeaveStatus);
exports.default = router;
//# sourceMappingURL=leaveRoutes.js.map