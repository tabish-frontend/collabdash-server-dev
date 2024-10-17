import { Router } from "express";
import { Protect } from "../../middlewares";

import { getAllCalendarEvents } from "../../controllers";

const router = Router();

router.use(Protect);

router.route("/").get(getAllCalendarEvents);

export default router;
