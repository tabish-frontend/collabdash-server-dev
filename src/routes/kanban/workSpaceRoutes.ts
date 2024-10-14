import { Router } from "express";
import { emitToWorkspaceMembers, Protect, restrictTo } from "../../middlewares";

import {
  addWorkspace,
  deleteWorkSpace,
  getAllWorkspaces,
  updateWorkspace,
} from "../../controllers";

const router = Router();

router.use(Protect);

router
  .route("/")
  .get(getAllWorkspaces)
  .post(
    restrictTo("hr", "admin"),
    addWorkspace,
    emitToWorkspaceMembers("workSpace created")
  );

router.use(restrictTo("hr", "admin"));

router
  .route("/:id")
  .patch(updateWorkspace, emitToWorkspaceMembers("workSpace updated"))
  .delete(deleteWorkSpace, emitToWorkspaceMembers("workSpace deleted"));

export default router;
