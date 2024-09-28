import { UserModel } from "../models";
import { catchAsync, APIFeatures } from "../utils";

export const getContacts = catchAsync(async (req: any, res: any) => {
  // Always filter out the current user and ensure account_status is "active"
  let filter: any = {
    _id: { $nin: req.user._id },
    account_status: "active", // default filter
  };

  // Initialize the APIFeatures class with the default filter and query params from req.query
  const features = new APIFeatures(UserModel.find(filter), req.query)
    .filter()
    .search(); // Apply search if provided

  // Bypass the APIFeatures limitFields method and manually set the fields to full_name and avatar
  const contacts = await features.query.select(
    "full_name avatar email department"
  );

  return res.status(200).json({
    status: "success",
    results: contacts.length,
    data: contacts,
  });
});
