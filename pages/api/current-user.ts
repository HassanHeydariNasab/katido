import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import type { User } from "@prisma/client";
import { verify as verifyJWT } from "njwt";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === "GET") {
    const token = req.headers.authorization;

    try {
      const jwt = verifyJWT(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: +jwt.body.toJSON().id as number },
      });
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
    }
  }
}
