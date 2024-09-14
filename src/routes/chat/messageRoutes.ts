import { Router } from "express";
import { Protect } from "../../middlewares";

import { getMessages, getThreads, sendMessage } from "../../controllers";

const router = Router();

router.use(Protect);

router.route("/").get(getThreads);

router.route("/:threadId").get(getMessages);

router.route("/send").post(sendMessage);

export default router;
