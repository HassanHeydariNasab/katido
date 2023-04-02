import type { NextApiRequest, NextApiResponse } from "next";
import type { User } from "@prisma/client";
import { tedisPool } from "prisma/redis";
import { create as createJWT } from "njwt";

import prisma from "prisma/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === "POST") {
    const { phoneNumber, otp, name } = req.body;

    const user = await prisma.user.findUnique({ where: { phoneNumber } });

    const tedis = await tedisPool.getTedis();
    const correctOtp = await tedis.get(phoneNumber);
    let token: string | undefined;
    if (otp === correctOtp) {
      let createdUser: User | undefined;
      let userId: number | undefined;
      if (user === null) {
        createdUser = await prisma.user.create({ data: { phoneNumber, name } });
        userId = createdUser.id;
      } else {
        userId = user.id;
      }
      token = createJWT({ id: userId }, process.env.JWT_SECRET).compact();
      res
        .setHeader(
          "Set-Cookie",
          `token=${token}; Max-Age=${3600 * 24 * 30}; HttpOnly;`
        )
        .status(createdUser ? 201 : 200)
        .json({});
      tedis.del(phoneNumber);
    } else {
      res.status(403).json({});
    }
    tedisPool.putTedis(tedis);
  }
}
