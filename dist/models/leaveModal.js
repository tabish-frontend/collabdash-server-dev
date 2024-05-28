"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeavesModal = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const utils_1 = require("../utils");
const leavesSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.default.Schema.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    reason: String,
    status: {
        type: String,
        enum: [
            utils_1.LeavesStatus.Pending,
            utils_1.LeavesStatus.Approved,
            utils_1.LeavesStatus.Declined,
        ],
        required: true,
        default: utils_1.LeavesStatus.Pending,
    },
    leave_type: {
        type: String,
        enum: [
            utils_1.LeavesTypes.Half_Day,
            utils_1.LeavesTypes.Sick,
            utils_1.LeavesTypes.Casual,
            utils_1.LeavesTypes.Emergency,
        ],
        required: true,
        default: utils_1.LeavesStatus.Pending,
    },
}, {
    timestamps: true,
});
exports.LeavesModal = mongoose_1.default.model("Leaves", leavesSchema);
//# sourceMappingURL=leaveModal.js.map