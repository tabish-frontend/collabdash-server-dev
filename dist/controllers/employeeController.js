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
exports.deleteEmployee = exports.updateEmployee = exports.getEmployee = exports.getAllEmployees = void 0;
const utils_1 = require("../utils");
const types_1 = require("../types");
const models_1 = require("../models");
const handleFactory_1 = require("./handleFactory");
exports.getAllEmployees = (0, utils_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.user.role === types_1.Roles.HR) {
        filter.role = { $nin: [types_1.Roles.HR, types_1.Roles.Admin] }; // Exclude HR and Admin
    }
    else if (req.user.role === types_1.Roles.Admin) {
        filter.role = { $ne: types_1.Roles.Admin }; // Exclude only Admin
    }
    const total_counts = yield models_1.UserModel.find();
    const features = new utils_1.APIFeatures(models_1.UserModel.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    // const document = await features.query.explain();
    const document = yield features.query.select(utils_1.ExcludedFields);
    return res.status(200).json(new utils_1.AppResponse(200, {
        users: document,
        result: document.length,
        total_counts: total_counts.length,
    }, "", utils_1.ResponseStatus.SUCCESS));
}));
exports.getEmployee = (0, handleFactory_1.getOne)(models_1.UserModel, utils_1.ExcludedFields);
exports.updateEmployee = (0, handleFactory_1.updateOne)(models_1.UserModel, utils_1.ExcludedFields);
exports.deleteEmployee = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    const document = yield models_1.UserModel.findOneAndUpdate({ username: username }, {
        account_status: types_1.AccountStatus.Deleted,
    });
    if (!document) {
        throw new utils_1.AppError("No document found with that ID", 404);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, {}, "User deleted  Successfully", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=employeeController.js.map