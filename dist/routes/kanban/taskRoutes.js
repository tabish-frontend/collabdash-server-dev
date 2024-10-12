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
router.route("/").post(controllers_1.addTask, controllers_1.fecthBoardForSocket);
router
    .route("/:id")
    .patch(controllers_1.updateTask, controllers_1.fecthBoardForSocket)
    .delete(controllers_1.deleteTask, controllers_1.fecthBoardForSocket);
router.route("/move").post(controllers_1.moveTask, controllers_1.fecthBoardForSocket);
router.use(express_2.default.urlencoded({ extended: false }));
router.route("/attachment").post(middlewares_1.uploadUserPhoto, controllers_1.uploadAttachment);
router.route("/attachment/:id").delete(controllers_1.deleteAttachment);
exports.default = router;
//# sourceMappingURL=taskRoutes.js.map