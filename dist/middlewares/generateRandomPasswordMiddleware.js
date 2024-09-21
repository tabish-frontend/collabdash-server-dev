"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePassword = void 0;
const generatePassword = (req, res, next) => {
    // const tempPassword = crypto.randomBytes(8 / 2).toString("hex");
    // req.body.password = tempPassword;
    req.body.password = "CollabDash@1";
    next();
};
exports.generatePassword = generatePassword;
//# sourceMappingURL=generateRandomPasswordMiddleware.js.map