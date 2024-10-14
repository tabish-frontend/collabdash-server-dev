"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../../middlewares");
const controllers_1 = require("../../controllers");
const router = (0, express_1.Router)();
router.use(middlewares_1.Protect);
router.use((0, middlewares_1.restrictTo)("hr", "admin"));
router.route("/").post(controllers_1.addColumn, (0, middlewares_1.emitToBoardMembers)("column created"));
router
    .route("/:id")
    .patch(controllers_1.updateColumn, (0, middlewares_1.emitToBoardMembers)("column updated"))
    .delete(controllers_1.clearAnddeleteColumn, (0, middlewares_1.emitToBoardMembers)("column cleared | deleted"));
router.route("/move").post(controllers_1.moveColumn, (0, middlewares_1.emitToBoardMembers)("column moved"));
exports.default = router;
//# sourceMappingURL=columnRoutes.js.map