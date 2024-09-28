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
exports.getContacts = void 0;
const models_1 = require("../models");
const utils_1 = require("../utils");
exports.getContacts = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Always filter out the current user and ensure account_status is "active"
    let filter = {
        _id: { $nin: req.user._id },
        account_status: "active", // default filter
    };
    // Initialize the APIFeatures class with the default filter and query params from req.query
    const features = new utils_1.APIFeatures(models_1.UserModel.find(filter), req.query)
        .filter()
        .search(); // Apply search if provided
    // Bypass the APIFeatures limitFields method and manually set the fields to full_name and avatar
    const contacts = yield features.query.select("full_name avatar email department");
    return res.status(200).json({
        status: "success",
        results: contacts.length,
        data: contacts,
    });
}));
//# sourceMappingURL=contacts.js.map