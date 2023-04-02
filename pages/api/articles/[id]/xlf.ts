import { cwd } from "node:process";
import { exec } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";

import type { NextApiRequest, NextApiResponse } from "next";

import { tokenToUserId } from "utils/tokenToUserId";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  const token = req.cookies.token;
  const userId = tokenToUserId(token, res);
  if (userId === null) return;

  if (req.method === "GET") {
    const file = await readFile(`${cwd()}/upload/xlf/${id}.xlf`, {
      flag: "r",
      encoding: "utf-8",
    });

    res.status(200).json({ xlf: file });
  } else if (req.method === "PUT") {
    const { xlf } = req.body;

    await writeFile(`${cwd()}/upload/xlf/${id}.xlf`, xlf);

    exec(
      `xliff2odf -i ${cwd()}/upload/xlf/${id}.xlf -o ${cwd()}/upload/tt/${id}.odt -t ${cwd()}/upload/st/${id}.odt`,
      (error, stdout, stderr) => {
        res.status(200).json({});
      }
    );
  }
}
