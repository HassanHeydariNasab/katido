import { exec } from "node:child_process";
import { cwd } from "node:process";

import type { NextApiRequest, NextApiResponse } from "next";
import Formidable from "formidable";

import { tokenToUserId } from "utils/tokenToUserId";
import prisma from "prisma/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const token = req.cookies.token;
    const userId = tokenToUserId(token, res);
    if (userId === null) return;

    const formidable = Formidable();
    formidable.on("file", async (name, file) => {
      if (name === "file") {
        const article = await prisma.article.create({
          data: {
            title: file.originalFilename,
            ownerId: userId,
            sourceLanguage: "en",
            targetLanguage: "fa",
          },
        });
        exec(
          `python3 -m unoserver.converter --convert-to odt ${
            file.filepath
          } ${cwd()}/upload/st/${
            article.id
          }.odt ; odf2xliff -i ${cwd()}/upload/st/${
            article.id
          }.odt -o ${cwd()}/upload/xlf/${article.id}.xlf`,
          async (error, stdout, stderr) => {
            console.log({ stdout, stderr });
            if (error === null) {
              res.status(201).json({ article });
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
