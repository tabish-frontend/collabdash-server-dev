"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../../middlewares");
const controllers_1 = require("../../controllers");
const express_2 = __importDefault(require("express"));
const middlewares_2 = require("../../middlewares");
const router = (0, express_1.Router)();
router.use(middlewares_1.Protect);
router.route("/").post(controllers_1.addTask, (0, middlewares_2.emitToBoardMembers)("task created"));
router
    .route("/:id")
    .patch(controllers_1.updateTask, (0, middlewares_2.emitToBoardMembers)("task updated"))
    .delete(controllers_1.deleteTask, (0, middlewares_2.emitToBoardMembers)("task deleted"));
router.route("/move").post(controllers_1.moveTask, (0, middlewares_2.emitToBoardMembers)("task moved"));
router.use(express_2.default.urlencoded({ extended: false }));
router.route("/attachment").post(middlewares_1.uploadUserPhoto, controllers_1.uploadAttachment);
router.route("/attachment/:id").delete(controllers_1.deleteAttachment);
exports.default = router;
//# sourceMappingURL=taskRoutes.js.map