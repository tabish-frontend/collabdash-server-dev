"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../../middlewares");
const controllers_1 = require("../../controllers");
const express_2 = __importDefault(require("express"));
const router = (0, express_1.Router)();
// PROTECTED ROUTES ONLY USE FOR HR
router.use(middlewares_1.Protect);
// router.use(restrictTo("hr", "admin"));
router.route("/").post(controllers_1.addTask);
router.route("/:id").patch(controllers_1.updateTask).delete(controllers_1.deleteTask);
router.route("/move").post(controllers_1.moveTask);
router.use(express_2.default.urlencoded({ extended: false }));
router.route("/attachment").post(middlewares_1.uploadUserPhoto, controllers_1.uploadAttachment);
router.route("/attachment/:id").delete(controllers_1.deleteAttachment);
exports.default = router;
//# sourceMappingURL=taskRoutes.js.map