import { Router } from "express";
import { Protect } from "../middlewares";

import { getContacts } from "../controllers";

const router = Router();

router.use(Protect);

router.route("/").get(getContacts);

export default router;
