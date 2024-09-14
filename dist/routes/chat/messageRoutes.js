"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../../middlewares");
const controllers_1 = require("../../controllers");
const router = (0, express_1.Router)();
router.use(middlewares_1.Protect);
router.route("/").get(controllers_1.getThreads);
router.route("/:threadId").get(controllers_1.getMessages);
router.route("/send").post(controllers_1.sendMessage);
exports.default = router;
//# sourceMappingURL=messageRoutes.js.map