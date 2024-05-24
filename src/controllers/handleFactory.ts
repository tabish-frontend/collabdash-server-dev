import {
  APIFeatures,
  AppError,
  AppResponse,
  ResponseStatus,
  catchAsync,
} from "../utils";

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

export const getAll = (Model: any, getByRole = "", hideFields: string) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter: any = {
      role: getByRole,
    };

    if (req.params.tourId) filter = { tour: req.params.tourId };

    // if (excludeCurrentUser) {
    //   filter._id = { $ne: req.user._id };
    // }

    const total_counts = await Model.find();
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const document = await features.query.explain();
    const document = await features.query.select(hideFields);

    return res.status(200).json(
      new AppResponse(
        200,
        {
          users: document,
          result: document.length,
          total_counts: total_counts.length,
        },
        "",
        ResponseStatus.SUCCESS
      )
    );
  });

export const updateOne = (Model: any, hideFields: string) =>
  catchAsync(async (req, res, next) => {
    const { _id, username } = req.params;

    const document = Model.findByIdAndUpdate(
      {
        $or: [{ username }, { _id }],
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).select(hideFields);

    if (!document) {
      return next(new AppError("No document found with that ID", 404));
    }

    return res
      .status(200)
      .json(
        new AppResponse(
          200,
          document,
          "User updated Successfully",
          ResponseStatus.SUCCESS
        )
      );
  });
