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
exports.ThreadModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const utils_1 = require("../../utils");
const threadSchema = new mongoose_1.Schema({
    messages: [
        {
            type: mongoose_1.default.Schema.ObjectId,
            ref: "Message",
            default: [],
        },
    ],
    participants: [
        {
            type: mongoose_1.default.Schema.ObjectId,
            ref: "User",
        },
    ],
    type: {
        type: String,
        enum: [utils_1.ChatType.ONE_TO_ONE, utils_1.ChatType.GROUP],
        required: true,
        default: utils_1.ChatType.ONE_TO_ONE,
    },
}, {
    timestamps: true,
});
exports.ThreadModel = mongoose_1.default.model("Thread", threadSchema);
//# sourceMappingURL=threadModel.js.map