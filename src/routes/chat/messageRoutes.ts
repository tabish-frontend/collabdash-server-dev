import { Router } from "express";
import { Protect } from "../../middlewares";

import {
  getContacts,
  getParticipitantsByThreadKey,
  getThreadByKey,
  getThreads,
  sendMessage,
} from "../../controllers";

const router = Router();

router.use(Protect);

router.route("/").get(getThreads);

router.route("/contacts").get(getContacts);

router.route("/thread/:threadkey").get(getThreadByKey);

router.route("/:threadkey").get(getParticipitantsByThreadKey);

router.route("/send").post(sendMessage);

export default router;
