"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../../middlewares");
const controllers_1 = require("../../controllers");
const router = (0, express_1.Router)();
// PROTECTED ROUTES ONLY USE FOR HR
router.use(middlewares_1.Protect);
router.use((0, middlewares_1.restrictTo)("hr", "admin"));
router.route("/").get(controllers_1.getAllWorkspaces).post(controllers_1.addWorkspace);
router.route("/:id").patch(controllers_1.updateWorkspace).delete(controllers_1.deleteWorkSpace);
exports.default = router;
//# sourceMappingURL=workSpaceRoutes.js.map