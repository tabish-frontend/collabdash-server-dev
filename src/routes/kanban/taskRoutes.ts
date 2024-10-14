import { Router } from "express";
import { Protect, uploadUserPhoto } from "../../middlewares";
import {
  addTask,
  deleteAttachment,
  deleteTask,
  moveTask,
  updateTask,
  uploadAttachment,
} from "../../controllers";
import express from "express";
import { emitToBoardMembers } from "../../middlewares";

const router = Router();

router.use(Protect);

router.route("/").post(addTask, emitToBoardMembers("task created"));

router
  .route("/:id")
  .patch(updateTask, emitToBoardMembers("task updated"))
  .delete(deleteTask, emitToBoardMembers("task deleted"));

router.route("/move").post(moveTask, emitToBoardMembers("task moved"));

router.use(express.urlencoded({ extended: false }));

router.route("/attachment").post(uploadUserPhoto, uploadAttachment);

router.route("/attachment/:id").delete(deleteAttachment);

export default router;
