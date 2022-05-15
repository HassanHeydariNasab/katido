import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { tokenToUserId } from "utils/tokenToUserId";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  const token = req.cookies.token;
  const userId = tokenToUserId(token, res);
  if (userId === null) return;

  if (req.method === "GET") {
    const article = prisma.article.findUnique({ where: { id: +id } });
    if (article === null) {
      res.status(404).json({ message: "Article not found." });
    } else {
      res.status(200).json({ article });
    }
  } else if (req.method === "PATCH") {
    const { body: patch } = req;
    await prisma.article.update({ where: { id: +id }, data: patch });
    res.status(200).json({});
  }
}
