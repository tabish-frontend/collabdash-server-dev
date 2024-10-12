"use strict";
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
exports.deleteOldNotifications = void 0;
const models_1 = require("../../models");
const utils_1 = require("../../utils");
exports.deleteOldNotifications = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    // Delete all notifications older than 3 days
    const result = yield models_1.NotificationModel.deleteMany({
        createdAt: { $lt: threeDaysAgo },
    });
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, { deletedCount: result.deletedCount }, "Old notifications deleted successfully", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=deletePrviousNotification.js.map