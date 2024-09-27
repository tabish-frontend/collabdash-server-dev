"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../../controllers");
const middlewares_1 = require("../../middlewares");
const router = (0, express_1.Router)();
// PROTECTED ROUTES
router.use(middlewares_1.Protect);
router.get("/", controllers_1.getNotifications);
// Create a new notification
router.post("/add", controllers_1.createNotification);
// Mark notification as read
router.patch("/:id/read", controllers_1.markNotificationAsRead);
exports.default = router;
//# sourceMappingURL=notificationRoutes.js.map