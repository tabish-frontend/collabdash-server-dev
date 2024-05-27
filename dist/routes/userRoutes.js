"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
// PROTECTED ROUTES
router.use(middlewares_1.Protect);
router.get("/me", middlewares_1.getMyId, controllers_1.getMe);
router.patch("/update-me", middlewares_1.uploadUserPhoto, controllers_1.updateMe);
router.delete("/delete-me", controllers_1.deleteMe);
router.get("/attendance", middlewares_1.getMyId, controllers_1.getUserAttendance);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map