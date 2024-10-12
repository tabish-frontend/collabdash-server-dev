"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../middlewares");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
router.use(middlewares_1.Protect);
// router.use(restrictTo("hr", "admin"));
router.route("/deleteOldNotification").delete(controllers_1.deleteOldNotifications);
exports.default = router;
//# sourceMappingURL=otherRoutes.js.map