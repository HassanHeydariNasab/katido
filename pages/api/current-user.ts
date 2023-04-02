import type { NextApiRequest, NextApiResponse } from "next";

import { tokenToUserId } from "utils/tokenToUserId";
import prisma from "prisma/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === "GET") {
    const token = req.cookies.token;
    const userId = tokenToUserId(token, res);
    if (userId === null) return;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(401).json({}); // it's actually a 404
    }
  }
}
