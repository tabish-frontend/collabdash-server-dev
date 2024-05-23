"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyId = void 0;
const getMyId = (req, res, next) => {
    req.params._id = req.user._id;
    next();
};
exports.getMyId = getMyId;
//# sourceMappingURL=getUserIdMiddleware.js.map