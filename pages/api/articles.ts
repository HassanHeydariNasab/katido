import { exec } from "node:child_process";
import type { NextApiRequest, NextApiResponse } from "next";
import { Phrase, PrismaClient } from "@prisma/client";
import Formidable from "formidable";
import { SentenceTokenizer } from "natural";
import { tokenToUserId } from "utils/tokenToUserId";

const prisma = new PrismaClient();
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const articles = await prisma.article.findMany();
    res.status(200).json({ results: articles });
  } else if (req.method === "POST") {
    const token = req.cookies.token;
    const userId = tokenToUserId(token, res);
    if (userId === null) return;

    const formidable = Formidable();
    formidable.on("file", (name, file) => {
      if (name === "file") {
        exec(
          `python3 -m unoserver.converter --convert-to txt ${file.filepath} -`,
          async (error, stdout, stderr) => {
            if (error === null) {
              const articleST = stdout.trim();

              const article = await prisma.article.create({
                data: {
                  title: file.originalFilename,
                  st: articleST.replace(/\n/g, "<br/><br/>"),
                  ownerId: userId,
                },
              });

              const _paragraphs = articleST.split("\n");

              for (let i = 0; i < _paragraphs.length; i++) {
                let _paragraph = _paragraphs[i].trim();

                const paragraph = await prisma.paragraph.create({
                  data: {
                    seq: i,
                    st: _paragraph,
                    articleId: article.id,
                  },
                });

                const sentenceTokenizer = new SentenceTokenizer();
                const _phrases = sentenceTokenizer.tokenize(_paragraph);
                const phrases: Partial<Phrase>[] = _phrases.map(
                  (_phrase, index) => ({
                    seq: index,
                    st: _phrase,
                    paragraphId: paragraph.id,
                  })
                );
                await prisma.phrase.createMany({
                  data: phrases as Phrase[],
                });
              }

              res.status(201).json({});
            } else {
              res
                .status(400)
                .json({ message: "An error occurred in processing the file" });
            }
          }
        );
      }
    });
    formidable.parse(req, (error) => {
      if (error) {
        res.status(400).json({ message: "Bad request" });
      }
    });
  }
}
