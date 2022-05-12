import type { NextApiResponse } from "next";
import { verify as verifyJWT } from "njwt";

export function tokenToUserId(token: string, res: NextApiResponse) {
  try {
    const jwt = verifyJWT(token, process.env.JWT_SECRET);
    const userId = +jwt.body.toJSON().id as number;
    if (typeof userId === "number") {
      return userId;
    } else {
      res.status(401).json({});
      return null;
    }
  } catch (error) {
    res.status(401).json({});
    return null;
  }
}
