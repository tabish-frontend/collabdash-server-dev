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
exports.updateOne = exports.getAll = exports.getOne = void 0;
const utils_1 = require("../utils");
const getOne = (Model, hideFields, popOptions) => (0, utils_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id, username } = req.params;
    let query = Model.findOne({
        $or: [{ username }, { _id }],
    }).select(hideFields);
    if (popOptions)
        query = query.populate(popOptions);
    const document = yield query;
    if (!document) {
        throw new utils_1.AppError("No document found with that ID", 404);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, document, "", utils_1.ResponseStatus.SUCCESS));
}));
exports.getOne = getOne;
const getAll = (Model, excludeCurrentUser = false, hideFields) => (0, utils_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.tourId)
        filter = { tour: req.params.tourId };
    if (excludeCurrentUser) {
        filter._id = { $ne: req.user._id };
    }
    const total_counts = yield Model.find();
    const features = new utils_1.APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    // const document = await features.query.explain();
    const document = yield features.query.select(hideFields);
    return res.status(200).json(new utils_1.AppResponse(200, {
        users: document,
        result: document.length,
        total_counts: total_counts.length,
    }, "", utils_1.ResponseStatus.SUCCESS));
}));
exports.getAll = getAll;
const updateOne = (Model, hideFields) => (0, utils_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id, username } = req.params;
    const document = Model.findByIdAndUpdate({
        $or: [{ username }, { _id }],
    }, req.body, {
        new: true,
        runValidators: true,
    }).select(hideFields);
    if (!document) {
        return next(new utils_1.AppError("No document found with that ID", 404));
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, document, "User updated Successfully", utils_1.ResponseStatus.SUCCESS));
}));
exports.updateOne = updateOne;
//# sourceMappingURL=handleFactory.js.map