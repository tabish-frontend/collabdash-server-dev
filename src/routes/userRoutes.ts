import { Router } from "express";
import { deleteMe, getMe, getUserAttendance, updateMe } from "../controllers";
import { Protect, getMyId, uploadUserPhoto } from "../middlewares";

const router = Router();

// PROTECTED ROUTES

router.use(Protect);

router.get("/me", getMyId, getMe);

router.patch("/update-me", uploadUserPhoto, updateMe);

router.delete("/delete-me", deleteMe);

router.get("/attendance", getMyId, getUserAttendance);

export default router;
