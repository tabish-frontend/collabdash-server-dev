import { Router } from "express";
import {
  createNotification,
  getNotifications,
  markNotificationAsRead,
} from "../../controllers";
import { Protect } from "../../middlewares";

const router = Router();

// PROTECTED ROUTES

router.use(Protect);

router.get("/", getNotifications);

// Create a new notification
router.post("/add", createNotification);

// Mark notification as read
router.patch("/:id/read", markNotificationAsRead);

export default router;
