import { Router } from "express";
import { emitToBoardMembers, Protect, restrictTo } from "../../middlewares";
import {
  addColumn,
  clearAnddeleteColumn,
  moveColumn,
  updateColumn,
} from "../../controllers";

const router = Router();

router.use(Protect);

router.use(restrictTo("hr", "admin"));

router.route("/").post(addColumn, emitToBoardMembers("column created"));

router
  .route("/:id")
  .patch(updateColumn, emitToBoardMembers("column updated"))
  .delete(clearAnddeleteColumn, emitToBoardMembers("column cleared | deleted"));

router.route("/move").post(moveColumn, emitToBoardMembers("column moved"));

export default router;
