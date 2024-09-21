import crypto from "crypto";

export const generatePassword = (
  req: { body: { password: string } },
  res: any,
  next: () => void
) => {
  // const tempPassword = crypto.randomBytes(8 / 2).toString("hex");
  // req.body.password = tempPassword;
  req.body.password = "CollabDash@1";
  next();
};
