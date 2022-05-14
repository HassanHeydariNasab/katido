import { readFile } from "node:fs/promises";
import { cwd } from "node:process";
import { useEffect, useState } from "react";
import type { FC } from "react";
import type { GetServerSideProps } from "next";
import { Phrase, PrismaClient } from "@prisma/client";
import type { Article } from "@prisma/client";
import { SentenceTokenizer } from "natural";
import Header from "components/molecules/Header";

interface ArticleProps {
  article: Article;
  xlf: string;
}

interface Unit {
  st: string;
  tt: string;
  phrases: Partial<Phrase>[];
}

const Xlf: FC<{ xlf: string }> = ({ xlf }) => {
  const [units, setUnits] = useState<Unit[] | null>(null);

  useEffect(() => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xlf, "text/xml");
    const _units = xml.getElementsByTagName("trans-unit");
    const units: Unit[] = [];
    const tokenizer = new SentenceTokenizer();
    for (let i = 0; i < _units.length; i++) {
      const _unit = _units[i];
      const st = _unit.querySelector("source")?.textContent || "";
      const tt = _unit.querySelector("target")?.textContent || "";
      units.push({
        st,
        tt,
        phrases: tokenizer
          .tokenize(st)
          .map((sentence) => ({ st: sentence, tt: "" })),
      });
    }
    setUnits(units);
  }, [xlf]);

  if (units === null) {
    return undefined;
  }
  return (
    <div className="bg-zinc-200">
      {units.map((unit, index) => (
        <form key={index}>
          <p>{unit.st}</p>
          <input defaultValue={unit.tt} />
          <div className="bg-zinc-500">
            {unit.phrases.map((phrase) => (
              <p>{phrase.st}</p>
            ))}
          </div>
        </form>
      ))}
    </div>
  );
};

const Home: FC<ArticleProps> = ({ article, xlf }) => {
  return (
    <div className={"w-full h-full"}>
      <Header />
      <h2 className="px-4 text-center text-zinc-200">{article.title}</h2>

      <Xlf xlf={xlf} />
    </div>
  );
};

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async ({
  query: { id },
  res,
}) => {
  const article = await prisma.article.findUnique({
    where: { id: +id as number },
  });
  if (article === null) res.statusCode = 404;
  let xlf = "";
  try {
    xlf = await readFile(`${cwd()}/upload/xlf/${id}.xlf`, {
      encoding: "utf-8",
      flag: "r",
    });
  } catch (error) {
    res.statusCode = 404;
  }
  return { props: { article: JSON.parse(JSON.stringify(article)), xlf } };
};

export default Home;
