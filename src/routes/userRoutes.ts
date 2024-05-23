import { Router } from "express";
import { deleteMe, getMe, updateMe } from "../controllers";
import { Protect, getMyId, uploadUserPhoto } from "../middlewares";

const router = Router();

// PROTECTED ROUTES

router.use(Protect);

router.get("/me", getMyId, getMe);

router.patch("/update-me", uploadUserPhoto, updateMe);

router.delete("/delete-me", deleteMe);

export default router;
