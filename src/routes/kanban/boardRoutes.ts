import { Router } from "express";
import { Protect, restrictTo } from "../../middlewares";

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

router.route("/").get(getAllBoards).post(addBoard);

router.route("/:id").patch(updateBoard).delete(deleteBoard);

export default router;
