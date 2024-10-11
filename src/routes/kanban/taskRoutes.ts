import { Router } from "express";
import { Protect, restrictTo, uploadUserPhoto } from "../../middlewares";
import {
  addTask,
  deleteAttachment,
  deleteTask,
  fecthBoardForSocket,
  moveTask,
  updateTask,
  uploadAttachment,
} from "../../controllers";
import express from "express";

const router = Router();

// PROTECTED ROUTES ONLY USE FOR HR

router.use(Protect);

// router.use(restrictTo("hr", "admin"));

router.route("/").post(addTask, fecthBoardForSocket);

router
  .route("/:id")
  .patch(updateTask, fecthBoardForSocket)
  .delete(deleteTask, fecthBoardForSocket);

router.route("/move").post(moveTask, fecthBoardForSocket);

router.use(express.urlencoded({ extended: false }));

router.route("/attachment").post(uploadUserPhoto, uploadAttachment);

router.route("/attachment/:id").delete(deleteAttachment);

export default router;
