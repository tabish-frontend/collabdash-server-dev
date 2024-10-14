import { Router } from "express";
import { emitToBoardMembers, Protect, restrictTo } from "../../middlewares";

import {
  addBoard,
  deleteBoard,
  getAllBoards,
  updateBoard,
} from "../../controllers";

const router = Router();

// PROTECTED ROUTES ONLY USE FOR HR

router.use(Protect);

router.use(restrictTo("hr", "admin"));

router
  .route("/")
  .get(getAllBoards)
  .post(addBoard, emitToBoardMembers("board created"));

router
  .route("/:id")
  .patch(updateBoard, emitToBoardMembers("board updated"))
  .delete(deleteBoard, emitToBoardMembers("board deleted"));

export default router;
