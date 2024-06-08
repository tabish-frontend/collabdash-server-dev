import { Roles } from "../types";

export const excludeRolesMiddleware = (req: any, res: any, next: any) => {
  const userRole = req.user.role;

  // Modify the query to exclude HR and admin info based on the user's role
  if (userRole === Roles.HR) {
    req.excludedRoles = [Roles.HR, Roles.Admin];
  } else if (userRole === Roles.Admin) {
    req.excludedRoles = [Roles.Admin];
  } else {
    req.excludedRoles = [];
  }

  next();
};
