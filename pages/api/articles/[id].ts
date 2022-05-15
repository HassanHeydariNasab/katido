import { cwd } from "node:process";
import { readFile, writeFile } from "node:fs/promises";
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { tokenToUserId } from "utils/tokenToUserId";
import { exec } from "node:child_process";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { id, format = "odt" } = req.query;
    if (format === "odt") {
      const file = await readFile(`${cwd()}/upload/tt/${id}.odt`, {
        flag: "r",
      });
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${id}.${format}`
      );
      res.send(file);
      return;
    }
    exec(
      `python3 -m unoserver.converter --convert-to ${format} ${cwd()}/upload/tt/${id}.odt ${cwd()}/upload/tt/${id}.${format}`,
      async (error, stdout, stderr) => {
        const file = await readFile(`${cwd()}/upload/tt/${id}.${format}`, {
          flag: "r",
        });
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${id}.${format}`
        );
        res.send(file);
      }
    );
  } else if (req.method === "PUT") {
    const token = req.cookies.token;
    const userId = tokenToUserId(token, res);
    if (userId === null) return;

    const { id } = req.query;
    const { xlf } = req.body; // TODO add more Article props

    await writeFile(`${cwd()}/upload/xlf/${id}.xlf`, xlf);

    exec(
      `xliff2odf -i ${cwd()}/upload/xlf/${id}.xlf -o ${cwd()}/upload/tt/${id}.odt -t ${cwd()}/upload/st/${id}.odt`,
      (error, stdout, stderr) => {
        res.status(200).json({});
      }
    );
  }
}
