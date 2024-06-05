import { Router } from "express";
import {
  Protect,
  restrictTo,
  generatePassword,
  excludeRolesMiddleware,
} from "../middlewares";
import {
  signup,
  getAllEmployees,
  getEmployee,
  deleteEmployee,
  updateEmployee,
} from "../controllers";

const router = Router();

// PROTECTED ROUTES ONLY USE FOR HR

router.use(Protect);
router.use(restrictTo("hr", "admin"));

router
  .route("/")
  .get(excludeRolesMiddleware, getAllEmployees)
  .post(generatePassword, signup);

router
  .route("/:username")
  .get(getEmployee)
  .delete(deleteEmployee)
  .patch(updateEmployee);

export default router;
