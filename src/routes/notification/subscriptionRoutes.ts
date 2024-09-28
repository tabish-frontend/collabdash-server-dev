import { Router } from "express";
import {
  removeSubscription,
  sendNotification,
  subscribe,
} from "../../controllers";
import { Protect } from "../../middlewares";

const router = Router();

// PROTECTED ROUTES

router.use(Protect);

router.post("/subscribe", subscribe);
router.post("/remove", removeSubscription);

// Create a new notification
router.post("/send-notification", sendNotification);

// Mark notification as read

export default router;
