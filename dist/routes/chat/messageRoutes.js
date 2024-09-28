"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../../middlewares");
const controllers_1 = require("../../controllers");
const router = (0, express_1.Router)();
router.use(middlewares_1.Protect);
router.route("/").get(controllers_1.getThreads);
router.route("/thread/:threadkey").get(controllers_1.getThreadByKey);
router.route("/:threadkey").get(controllers_1.getParticipitantsByThreadKey);
router.route("/send").post(controllers_1.sendMessage);
exports.default = router;
//# sourceMappingURL=messageRoutes.js.map