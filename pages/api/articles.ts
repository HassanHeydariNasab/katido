import { exec } from "node:child_process";
import type { NextApiRequest, NextApiResponse } from "next";
import { Paragraph, Phrase, PrismaClient } from "@prisma/client";
import Formidable from "formidable";
import { JSDOM } from "jsdom";
import { SentenceTokenizer } from "natural";
import { tokenToUserId } from "utils/tokenToUserId";

const prisma = new PrismaClient();
export const config = {
  api: {
    bodyParser: false,
  },
};

/*
let seq = 0;
function findTextAndSetClass(element: Element) {
  if (element.firstElementChild === null) {
    element.setAttribute("data-katido-seq", seq.toString());
    seq++;
    const nextElementSibling = element.nextElementSibling;
    if (nextElementSibling !== null) {
      findTextAndSetClass(nextElementSibling);
    }
  } else {
    findTextAndSetClass(element.firstElementChild);
  }
}
*/

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
          `python3 -m unoserver.converter --convert-to html ${file.filepath} -`,
          async (error, stdout, stderr) => {
            if (error === null) {
              res.status(201).json({});
              const dom = new JSDOM(stdout);
              const body = dom.window.document.body;

              //console.log({ content: body.textContent });

              const article = await prisma.article.create({
                data: {
                  title: file.originalFilename,
                  st: dom.serialize(),
                  ownerId: userId,
                },
              });

              let seq = 0;
              body.querySelectorAll("*").forEach((element, key, parent) => {
                //console.log({ element, key, parent, seq });
                if (
                  element.firstElementChild === null &&
                  element.textContent !== ""
                ) {
                  element.setAttribute("data-katido-seq", seq.toString());
                  seq++;
                }
              });

              const _paragraphs = body.querySelectorAll("*[data-katido-seq]");
              console.log({ _paragraphs });

              for (let i = 0; i < _paragraphs.length; i++) {
                let _paragraph = _paragraphs[i];

                const paragraph = await prisma.paragraph.create({
                  data: {
                    seq: +_paragraph.getAttribute("data-katido-seq"),
                    st: _paragraph.textContent,
                    articleId: article.id,
                  },
                });

                const sentenceTokenizer = new SentenceTokenizer();
                const _phrases = sentenceTokenizer.tokenize(
                  _paragraph.textContent
                );
                const phrases: Partial<Phrase>[] = _phrases.map(
                  (_phrase, index) => ({
                    seq: index,
                    st: _phrase,
                    paragraphId: paragraph.id,
                  })
                );
                const r = await prisma.phrase.createMany({
                  data: phrases as Phrase[],
                });
                console.log({ phrases, r });
              }
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
