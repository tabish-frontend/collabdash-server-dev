"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const router = express_1.default.Router();
router.post("/signup", middlewares_1.generatePassword, controllers_1.signup);
router.post("/login", controllers_1.login);
router.post("/forgotPassword", controllers_1.forgotPassword);
router.patch("/resetPassword/:token", controllers_1.resetPassword);
//PROTECTED ROUTES
router.patch("/updateMyPassword", middlewares_1.Protect, controllers_1.updateMyPassword);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map