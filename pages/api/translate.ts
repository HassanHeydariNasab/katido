import type { NextApiRequest, NextApiResponse } from "next";

import { v2 as GoogleTranslate } from "@google-cloud/translate";

const googleTranslateClient = new GoogleTranslate.Translate({
  projectId: process.env.GOOGLE_PROJECT_ID,
  key: process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ tt: string }>
) {
  if (req.method === "POST") {
    const { st, from, to } = req.body;
    const result = await googleTranslateClient.translate(st, {
      from,
      to,
    });
    console.log({ result });
    return res.json({ tt: result[0] });
  }
}
