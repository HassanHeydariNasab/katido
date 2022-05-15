import { cwd } from "node:process";
import { exec } from "node:child_process";
import { readFile } from "node:fs/promises";
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { tokenToUserId } from "utils/tokenToUserId";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.cookies.token;
  const userId = tokenToUserId(token, res);
  if (userId === null) return;

  if (req.method === "GET") {
    const { id, format = "odt" } = req.query;

    if (format === "odt") {
      // odt files are synced with xlf files
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

    // other formats should be converted from odt files
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
  }
}
