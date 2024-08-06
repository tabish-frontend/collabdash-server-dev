import { Router } from "express";
import { Protect, restrictTo } from "../../middlewares";
import {
  addColumn,
  deleteColumn,
  moveColumn,
  updateColumn,
} from "../../controllers";

const router = Router();

// PROTECTED ROUTES ONLY USE FOR HR

router.use(Protect);

router.use(restrictTo("hr", "admin"));

router.route("/").post(addColumn);

router.route("/:id").patch(updateColumn).delete(deleteColumn);

router.route("/move/:boardID").patch(moveColumn);

export default router;
