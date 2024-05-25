"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../middlewares");
const controllers_1 = require("../controllers");
const router = (0, express_1.Router)();
// PROTECTED ROUTES ONLY USE FOR HR
router.use(middlewares_1.Protect);
router.use((0, middlewares_1.restrictTo)("hr", "admin"));
router.route("/").get(controllers_1.getAllEmployees).post(middlewares_1.generatePassword, controllers_1.signup);
router
    .route("/:username")
    .get(controllers_1.getEmployee)
    .delete(controllers_1.deleteEmployee)
    .patch(controllers_1.updateEmployee);
exports.default = router;
//# sourceMappingURL=employeeRoutes.js.map