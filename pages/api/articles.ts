import { PrismaClient } from "@prisma/client";
import type { Article } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

interface Result {
  results: Article[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Result>
) {
  const articles = await prisma.article.findMany();

  res.status(200).json({ results: articles });
}
