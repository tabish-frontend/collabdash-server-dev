"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupShift = void 0;
const lookupShift = () => ({
    $lookup: {
        from: "shifts",
        localField: "shift",
        foreignField: "_id",
        as: "shift",
    },
});
exports.lookupShift = lookupShift;
//# sourceMappingURL=shift.js.map