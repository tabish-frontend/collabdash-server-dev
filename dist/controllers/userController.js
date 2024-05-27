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
exports.deleteMe = exports.updateMe = exports.getMe = void 0;
const models_1 = require("../models");
const handleFactory_1 = require("./handleFactory");
const types_1 = require("../types");
const utils_1 = require("../utils");
exports.getMe = (0, handleFactory_1.getOne)(models_1.UserModel, utils_1.ExcludedFields);
exports.updateMe = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // 1) Create error if user Post password data in this route
    if (req.body.password || req.body.confirm_password) {
        throw new utils_1.AppError("This route is not for password updates, Please use /updateMyPassword route.", 400);
    }
    if ((0, utils_1.isFilesObject)(req.files)) {
        const avatar = yield (0, utils_1.uploadOnCloudinary)(req.files.avatar[0].path);
        req.body.avatar = avatar.url;
    }
    console.log("req.body.avatar", req.body.avatar);
    const updatedUser = yield models_1.UserModel.findByIdAndUpdate(req.user._id, req.body, {
        new: true,
        runValidators: true,
    }).select(utils_1.ExcludedFields);
    return res
        .status(201)
        .json(new utils_1.AppResponse(200, updatedUser, "User Updated succefully", utils_1.ResponseStatus.SUCCESS));
}));
exports.deleteMe = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield models_1.UserModel.findByIdAndUpdate(req.user._id, {
        account_status: types_1.AccountStatus.Deleted,
    });
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, null, "User Deleted succefully", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=userController.js.map