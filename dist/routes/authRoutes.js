"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import { Protect } from "../middlewares/authMiddlewares.js";
const generateRandomPasswordMiddleware_1 = require("../middlewares/generateRandomPasswordMiddleware");
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
// router.route("/refresh-token").post(refreshAccessToken);
router.post("/signup", generateRandomPasswordMiddleware_1.generatePassword, authController_1.signup);
router.post("/login", authController_1.login);
// router.post("/forgotPassword", forgotPassword);
// router.patch("/resetPassword/:token", refreshAccessToken);
//PROTECTED ROUTES
// router.use(Protect);
// router.post("/logout", logoutUser);
// router.patch("/updateMyPassword", updateMyPassword);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map