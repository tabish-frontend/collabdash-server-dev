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
exports.deleteTodo = exports.updateTodo = exports.getTodos = exports.addTodos = void 0;
const models_1 = require("../../models");
const utils_1 = require("../../utils");
exports.addTodos = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, date } = req.body;
    const owner = req.user._id;
    const newTodo = yield models_1.TodosModel.create({
        title,
        date,
        owner,
    });
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, newTodo, "Todos Added", utils_1.ResponseStatus.SUCCESS));
}));
exports.getTodos = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date } = req.query;
    const owner = req.user._id;
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    // Extract filters from req.query
    const filters = { date: { $gte: startOfDay, $lte: endOfDay }, owner };
    // Fetch todos with filters and user ID
    const allTodos = yield models_1.TodosModel.find(filters);
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, allTodos, "", utils_1.ResponseStatus.SUCCESS));
}));
exports.updateTodo = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { todoId } = req.params;
    const updateTodo = yield models_1.TodosModel.findByIdAndUpdate(todoId, req.body, {
        new: true,
        runValidators: true,
    });
    // Check if the 'completed' field exists in the body
    const message = req.body.hasOwnProperty("completed")
        ? `Todo Mark as ${req.body.completed === true ? "Completed" : "Uncomplete"}`
        : "Todo Updated";
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, updateTodo, message, utils_1.ResponseStatus.SUCCESS));
}));
exports.deleteTodo = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { todoId } = req.params;
    yield models_1.TodosModel.findByIdAndDelete(todoId);
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, null, "Todo Deleted", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=todosController.js.map