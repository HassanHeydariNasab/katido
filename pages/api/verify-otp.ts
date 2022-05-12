import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import type { User } from "@prisma/client";
import { tedisPool } from "prisma/redis";
import { create as createJWT } from "njwt";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === "POST") {
    const { email, otp, name } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    const tedis = await tedisPool.getTedis();
    const correctOtp = await tedis.get(email);
    let token: string | undefined;
    if (otp === correctOtp) {
      let createdUser: User | undefined;
      let userId: number | undefined;
      if (user === null) {
        createdUser = await prisma.user.create({ data: { email, name } });
        userId = createdUser.id;
      } else {
        userId = user.id;
      }
      token = createJWT({ id: userId }, process.env.JWT_SECRET).compact();
      res
        .setHeader("Set-Cookie", `token=${token}`)
        .status(createdUser ? 201 : 200)
        .json({});
      tedis.del(email);
    } else {
      res.status(401).json({});
    }
    tedisPool.putTedis(tedis);
  }
}
