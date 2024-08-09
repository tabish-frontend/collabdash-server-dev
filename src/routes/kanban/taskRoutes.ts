import { Router } from "express";
import { Protect, restrictTo } from "../../middlewares";
import { addTask, deleteTask, moveTask } from "../../controllers";

const router = Router();

// PROTECTED ROUTES ONLY USE FOR HR

router.use(Protect);

router.use(restrictTo("hr", "admin"));

router.route("/").post(addTask);

router.route("/:id").delete(deleteTask);

router.route("/move").post(moveTask);

export default router;
