import Crypto from "crypto";

import type { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "@prisma/client";

import { tedisPool } from "prisma/redis";
import { sendVerificationCode } from "services/sms";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ isUserExists: boolean }>
) {
  if (req.method === "POST") {
    const { phoneNumber } = req.body;

    const otp = Crypto.randomInt(100000, 200000).toString().substring(1);

    const tedis = await tedisPool.getTedis();
    tedis.setex(phoneNumber, 300, otp);
    tedisPool.putTedis(tedis);

    console.log({ otp });
    if (!sendVerificationCode(phoneNumber, otp)) {
      res.status(500);
    }

    const user = await prisma.user.findUnique({ where: { phoneNumber } });
    if (user === null) {
      res.status(200).json({ isUserExists: false });
    } else {
      res.status(200).json({ isUserExists: true });
    }
  }
}
