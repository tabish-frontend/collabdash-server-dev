import { Router } from "express";
import { Protect, restrictTo } from "../../middlewares";
import {
  addColumn,
  clearAnddeleteColumn,
  moveColumn,
  updateColumn,
} from "../../controllers";

const router = Router();

// PROTECTED ROUTES ONLY USE FOR HR

router.use(Protect);

router.use(restrictTo("hr", "admin"));

router.route("/").post(addColumn);

router.route("/:id").patch(updateColumn).delete(clearAnddeleteColumn);

router.route("/move").post(moveColumn);

export default router;
