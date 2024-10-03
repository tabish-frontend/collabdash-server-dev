"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../../middlewares");
const controllers_1 = require("../../controllers");
const router = (0, express_1.Router)();
router.use(middlewares_1.Protect);
router.route("/").post(controllers_1.addTodos).get(controllers_1.getTodos);
router.route("/:todoId").patch(controllers_1.updateTodo).delete(controllers_1.deleteTodo);
exports.default = router;
//# sourceMappingURL=todosRoutes.js.map