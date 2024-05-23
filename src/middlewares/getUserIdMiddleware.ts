export const getMyId = (req: any, res: any, next: () => void) => {
  req.params._id = req.user._id;
  next();
};
