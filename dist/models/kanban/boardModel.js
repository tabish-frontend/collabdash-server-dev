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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const taksModel_1 = require("./taksModel");
const columnModel_1 = require("./columnModel");
const BoardSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String },
    description: { type: String },
    members: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    owner: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    columns: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Column" }],
    tasks: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Task" }],
    workspace: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
    },
}, { timestamps: true });
// Middleware to delete columns and tasks when a board is deleted
BoardSchema.pre("findOneAndDelete", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const board = yield this.model.findOne(this.getQuery());
        if (!board)
            return next();
        // Delete all tasks related to the board
        yield taksModel_1.TaskModel.deleteMany({ column: { $in: board.columns } });
        // Delete all columns
        yield columnModel_1.ColumnModel.deleteMany({ _id: { $in: board.columns } });
        next();
    });
});
exports.BoardModel = mongoose_1.default.model("Board", BoardSchema);
exports.BoardModel.syncIndexes()
    .then(() => {
    console.log("Indexes synchronized successfully for MeetingModel.");
})
    .catch((error) => {
    console.error("Error synchronizing indexes for MeetingModel:", error);
});
//# sourceMappingURL=boardModel.js.map