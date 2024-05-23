import { AppError, AppResponse, ResponseStatus, catchAsync } from "../utils";

export const getOne = (Model: any, hideFields: string, popOptions?: any) =>
  catchAsync(async (req, res, next) => {
    const { _id, username } = req.params;

    let query = Model.findOne({
      $or: [{ username }, { _id }],
    }).select(hideFields);

    if (popOptions) query = query.populate(popOptions);
    const document = await query;

    if (!document) {
      throw new AppError("No document found with that ID", 404);
    }

    return res
      .status(200)
      .json(new AppResponse(200, document, "", ResponseStatus.SUCCESS));
  });
