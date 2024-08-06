"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../../middlewares");
const controllers_1 = require("../../controllers");
const router = (0, express_1.Router)();
// PROTECTED ROUTES ONLY USE FOR HR
router.use(middlewares_1.Protect);
router.use((0, middlewares_1.restrictTo)("hr", "admin"));
router.route("/").post(controllers_1.addColumn);
router.route("/:id").patch(controllers_1.updateColumn).delete(controllers_1.deleteColumn);
router.route("/move/:boardID").patch(controllers_1.moveColumn);
exports.default = router;
//# sourceMappingURL=columnRoutes.js.map