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
exports.ShiftModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const timeDetailsSchema = new mongoose_1.Schema({
    start: { type: Date, default: null },
    end: { type: Date, default: null },
    days: { type: [String], required: true },
});
// Create the Shift schema
const shiftSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    shift_type: { type: String, required: true },
    hours: { type: Number },
    times: { type: [timeDetailsSchema], required: true },
    weekends: { type: [String], required: true },
}, {
    timestamps: true,
});
exports.ShiftModel = mongoose_1.default.model("Shift", shiftSchema);
//# sourceMappingURL=shiftModel.js.map