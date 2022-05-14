import { readFile } from "node:fs/promises";
import { cwd } from "node:process";
import { useEffect, useState } from "react";
import type { FC } from "react";
import type { GetServerSideProps } from "next";
import { Phrase, PrismaClient } from "@prisma/client";
import type { Article } from "@prisma/client";
import { SentenceTokenizer } from "natural";
import Header from "components/molecules/Header";

interface Unit {
  st: string;
  tt: string;
  phrases: Partial<Phrase>[];
}

const Xlf: FC<{ xlf: string; title: string }> = ({ xlf, title }) => {
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
    <div className="flex overflow-x-hidden overflow-y-scroll relative flex-col flex-1 gap-4 px-4">
      <h2 className="px-4 text-center text-zinc-200">{title}</h2>
      {units.map((unit, index) => (
        <form key={index} className="p-2 rounded-lg bg-zinc-800">
          <p dir="auto" className="p-4 text-zinc-300">
            {unit.st}
          </p>
          <div className="p-4 text-white rounded-lg bg-zinc-900">
            {unit.phrases.map((phrase, index) => (
              <div key={index}>
                <p dir="auto">{phrase.st}</p>
                <textarea
                  defaultValue={phrase.tt}
                  className="p-2 w-full text-base text-white rounded-md bg-zinc-900"
                  aria-multiline={"true"}
                  dir="auto"
                />
              </div>
            ))}
          </div>
        </form>
      ))}
    </div>
  );
};

interface ArticleProps {
  article: Article;
  xlf: string;
}

const Home: FC<ArticleProps> = ({ article, xlf }) => {
  return (
    <div className={"flex flex-col h-full bg-zinc-600"}>
      <Header />
      <Xlf xlf={xlf} title={article.title} />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  query: { id },
  res,
}) => {
  const prisma = new PrismaClient();
  const article = await prisma.article.findUnique({
    where: { id: +id as number },
  });
  if (article === null) return { notFound: true };
  let xlf = "";
  try {
    xlf = await readFile(`${cwd()}/upload/xlf/${id}.xlf`, {
      encoding: "utf-8",
      flag: "r",
    });
  } catch (error) {
    return { notFound: true };
  }
  return { props: { article: JSON.parse(JSON.stringify(article)), xlf } };
};

export default Home;
