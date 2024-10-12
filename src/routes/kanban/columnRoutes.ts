import { Router } from "express";
import { Protect, restrictTo } from "../../middlewares";
import {
  addColumn,
  clearAnddeleteColumn,
  fecthBoardForSocket,
  moveColumn,
  updateColumn,
} from "../../controllers";

const router = Router();

// PROTECTED ROUTES ONLY USE FOR HR

router.use(Protect);

router.use(restrictTo("hr", "admin"));

router.route("/").post(addColumn, fecthBoardForSocket);

router
  .route("/:id")
  .patch(updateColumn, fecthBoardForSocket)
  .delete(clearAnddeleteColumn, fecthBoardForSocket);

router.route("/move").post(moveColumn, fecthBoardForSocket);

export default router;
