"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../../middlewares");
const controllers_1 = require("../../controllers");
const router = (0, express_1.Router)();
// PROTECTED ROUTES ONLY USE FOR HR
router.use(middlewares_1.Protect);
router.use((0, middlewares_1.restrictTo)("hr", "admin"));
router
    .route("/")
    .get(controllers_1.getAllBoards)
    .post(controllers_1.addBoard, (0, middlewares_1.emitToBoardMembers)("board created"));
router
    .route("/:id")
    .patch(controllers_1.updateBoard, (0, middlewares_1.emitToBoardMembers)("board updated"))
    .delete(controllers_1.deleteBoard, (0, middlewares_1.emitToBoardMembers)("board deleted"));
exports.default = router;
//# sourceMappingURL=boardRoutes.js.map