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
exports.getAllEmployees = (0, handleFactory_1.getAll)(models_1.UserModel, "employee", "-password -__v -createdAt -updatedAt ");
exports.getEmployee = (0, handleFactory_1.getOne)(models_1.UserModel, "-password -__v -createdAt -updatedAt");
exports.updateEmployee = (0, handleFactory_1.updateOne)(models_1.UserModel, "-password -__v -createdAt -updatedAt ");
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