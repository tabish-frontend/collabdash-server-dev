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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTask = exports.deleteAttachment = exports.uploadAttachment = exports.moveTask = exports.deleteTask = exports.addTask = void 0;
const models_1 = require("../../models");
const utils_1 = require("../../utils");
const models_2 = require("../../models");
const webPushConfig_1 = __importDefault(require("../../webPushConfig"));
exports.addTask = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, board, column } = req.body;
    const owner = req.user._id;
    // Create the new task
    const newTask = yield models_1.TaskModel.create({
        title,
        board,
        column,
        owner,
    });
    // Add the new task to the column
    yield models_1.ColumnModel.findByIdAndUpdate(column, {
        $push: { tasks: newTask._id },
    });
    // Add the new task to the board
    yield models_1.BoardModel.findByIdAndUpdate(board, {
        $push: { tasks: newTask._id },
    });
    // Populate the necessary fields
    const populatedTask = yield models_1.TaskModel.findById(newTask._id)
        .populate("owner", "full_name username avatar")
        .populate("assignedTo", "full_name username avatar");
    return res
        .status(201)
        .json(new utils_1.AppResponse(201, populatedTask, "Task created", utils_1.ResponseStatus.SUCCESS));
}));
exports.deleteTask = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deletedTask = yield models_1.TaskModel.findByIdAndDelete(id);
    if (!deletedTask) {
        return res
            .status(404)
            .json(new utils_1.AppResponse(404, null, "Task not found", utils_1.ResponseStatus.ERROR));
    }
    yield models_1.ColumnModel.findByIdAndUpdate(deletedTask.column, {
        $pull: { tasks: id },
    });
    yield models_1.BoardModel.findByIdAndUpdate(deletedTask.board, {
        $pull: { tasks: id },
    });
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, null, "Task Deleted", utils_1.ResponseStatus.SUCCESS));
}));
exports.moveTask = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { task_id, column_id, index } = req.body;
    const user = req.user;
    const task = yield models_1.TaskModel.findById(task_id).orFail(() => new utils_1.AppError("Task not found", 404));
    if (column_id) {
        const previousColumn = yield models_1.ColumnModel.findByIdAndUpdate(task.column, {
            $pull: { tasks: task_id },
        });
        const newColumn = yield models_1.ColumnModel.findByIdAndUpdate(column_id, {
            $push: { tasks: { $each: [task_id], $position: index } },
        });
        const isOwner = user._id.toString() === task.owner.toString();
        const Receiver = isOwner ? task.assignedTo : task.owner;
        const notificationMessage = `has moved Task ${task.title}  from ${previousColumn.name} to ${newColumn.name} `;
        yield models_1.NotificationModel.create({
            sender: user._id,
            receiver: Receiver,
            message: notificationMessage,
            link: task.title,
        });
        // if (user._id.toString() !== task.owner.toString()) {
        //   const notificationMessage = `${task.title} from ${previousColumn.name} to ${newColumn.name} `;
        //   const senderId =
        //   await NotificationModel.create({
        //     sender: user._id,
        //     receiver: task.owner,
        //     message: notificationMessage,
        //     message_type: "has moved Task",
        //   });
        // }
        const subscriptions = yield models_2.PushSubscriptionModel.find({
            user: { $in: Receiver },
        });
        const pushNotificationMessage = `${user.full_name} ${notificationMessage}`;
        // Send push notification
        subscriptions.forEach((subscription) => __awaiter(void 0, void 0, void 0, function* () {
            const payload = JSON.stringify({
                title: `Task Update: ${task.title}`,
                message: pushNotificationMessage,
                icon: "http://res.cloudinary.com/djorjfbc6/image/upload/v1727342021/mmwfdtqpql2ljosvj3kn.jpg",
                url: `/workspaces`, // URL to navigate on notification click
            });
            try {
                yield webPushConfig_1.default.sendNotification(subscription, payload);
            }
            catch (error) { }
        }));
        task.column = column_id;
        yield task.save();
    }
    else {
        const column = yield models_1.ColumnModel.findById(task.column).orFail(() => new utils_1.AppError("Column not found", 404));
        const currentIndex = column.tasks.indexOf(task_id);
        column.tasks.splice(currentIndex, 1);
        column.tasks.splice(index, 0, task_id);
        yield column.save();
    }
    const populatedTask = yield models_1.TaskModel.findById(task_id)
        .populate("board", "name")
        .populate("column", "name")
        .populate("assignedTo", "full_name username");
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, populatedTask, "Task moved", utils_1.ResponseStatus.SUCCESS));
}));
exports.uploadAttachment = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let attachment = "";
    if ((0, utils_1.isFilesObject)(req.files)) {
        const file = yield (0, utils_1.uploadOnCloudinary)(req.files.attachment[0].path);
        console.log("File", file);
        attachment = file.url;
        console.log("attachment", attachment);
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, attachment, "Attachment Uploaded", utils_1.ResponseStatus.SUCCESS));
}));
exports.deleteAttachment = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield (0, utils_1.deleteFromCloudinary)(id);
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, null, "Attachment Deleted", utils_1.ResponseStatus.SUCCESS));
}));
exports.updateTask = (0, utils_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { owner, assignedTo, title } = req.body;
    const receiver = assignedTo.map((item) => item._id);
    let notificationMessage = `has assigned you a Task ${title}`;
    const updatedTask = yield models_1.TaskModel.findByIdAndUpdate(id, req.body, {
        new: true,
    })
        .populate("owner", "username full_name avatar")
        .populate("assignedTo", "username full_name avatar");
    if (!updatedTask) {
        throw new utils_1.AppError("Board not found", 404);
    }
    if (assignedTo.length) {
        const getNotification = yield models_1.NotificationModel.find({
            receiver: { $in: [assignedTo] },
        });
        if (getNotification.length) {
            notificationMessage = `has made some changes in Task ${title}`;
        }
        yield models_1.NotificationModel.create({
            sender: owner._id,
            receiver,
            message: notificationMessage,
            link: title,
        });
        const subscriptions = yield models_2.PushSubscriptionModel.find({
            user: { $in: receiver },
        });
        console.log("subscriptions", subscriptions);
        const pushNotificationMessage = `${owner.full_name} ${notificationMessage}`;
        // Send push notification
        subscriptions.forEach((subscription) => __awaiter(void 0, void 0, void 0, function* () {
            const payload = JSON.stringify({
                title: `Task Update: ${title}`,
                message: pushNotificationMessage,
                icon: "http://res.cloudinary.com/djorjfbc6/image/upload/v1727342021/mmwfdtqpql2ljosvj3kn.jpg",
                url: `/workspaces`, // URL to navigate on notification click
            });
            try {
                yield webPushConfig_1.default.sendNotification(subscription, payload);
            }
            catch (error) { }
        }));
    }
    return res
        .status(200)
        .json(new utils_1.AppResponse(200, updatedTask, "Task Updated", utils_1.ResponseStatus.SUCCESS));
}));
//# sourceMappingURL=taskController.js.map