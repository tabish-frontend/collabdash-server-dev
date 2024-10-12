"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../../middlewares");
const controllers_1 = require("../../controllers");
const router = (0, express_1.Router)();
// PROTECTED ROUTES ONLY USE FOR HR
router.use(middlewares_1.Protect);
router.use((0, middlewares_1.restrictTo)("hr", "admin"));
router.route("/").post(controllers_1.addColumn, controllers_1.fecthBoardForSocket);
router
    .route("/:id")
    .patch(controllers_1.updateColumn, controllers_1.fecthBoardForSocket)
    .delete(controllers_1.clearAnddeleteColumn, controllers_1.fecthBoardForSocket);
router.route("/move").post(controllers_1.moveColumn, controllers_1.fecthBoardForSocket);
exports.default = router;
//# sourceMappingURL=columnRoutes.js.map