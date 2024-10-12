import { Router } from "express";
import { Protect, restrictTo } from "../middlewares";
import { deleteOldNotifications } from "../controllers";

const router = Router();

router.use(Protect);
// router.use(restrictTo("hr", "admin"));

router.route("/deleteOldNotification").delete(deleteOldNotifications);

export default router;
