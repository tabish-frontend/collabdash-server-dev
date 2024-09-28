"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../../controllers");
const middlewares_1 = require("../../middlewares");
const router = (0, express_1.Router)();
// PROTECTED ROUTES
router.use(middlewares_1.Protect);
router.post("/subscribe", controllers_1.subscribe);
router.post("/remove", controllers_1.removeSubscription);
// Create a new notification
router.post("/send-notification", controllers_1.sendNotification);
// Mark notification as read
exports.default = router;
//# sourceMappingURL=subscriptionRoutes.js.map