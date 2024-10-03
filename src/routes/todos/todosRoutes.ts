import { Router } from "express";
import { Protect } from "../../middlewares";

import { addTodos, deleteTodo, getTodos, updateTodo } from "../../controllers";

const router = Router();

router.use(Protect);

router.route("/").post(addTodos).get(getTodos);

router.route("/:todoId").patch(updateTodo).delete(deleteTodo);

export default router;
