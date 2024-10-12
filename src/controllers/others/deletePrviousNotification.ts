import { NotificationModel } from "../../models";
import { AppResponse, catchAsync, ResponseStatus } from "../../utils";

export const deleteOldNotifications = catchAsync(async (req: any, res: any) => {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  // Delete all notifications older than 3 days
  const result = await NotificationModel.deleteMany({
    createdAt: { $lt: threeDaysAgo },
  });

  return res
    .status(200)
    .json(
      new AppResponse(
        200,
        { deletedCount: result.deletedCount },
        "Old notifications deleted successfully",
        ResponseStatus.SUCCESS
      )
    );
});
