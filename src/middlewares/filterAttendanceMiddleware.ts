export const filterAttendanceByRole = (req: any, res: any, next: any) => {
  const { role } = req.user;

  // Define the pipeline modification based on roles
  let pipelineModification: any[] = [];
  if (role === "admin") {
    pipelineModification = [
      { $match: { role: { $ne: "admin" } } }, // Exclude admin users
    ];
  } else if (role === "hr") {
    pipelineModification = [
      { $match: { role: { $nin: ["hr", "admin"] } } }, // Exclude hr and admin users
    ];
  }

  // Apply the pipeline modification to the aggregation pipeline
  req.pipelineModification = pipelineModification;
  next();
};
