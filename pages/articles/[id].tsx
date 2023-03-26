import { readFile } from "node:fs/promises";
import { cwd } from "node:process";

import type { FC } from "react";
import type { GetServerSideProps } from "next";

import { PrismaClient } from "@prisma/client";
import type { Article } from "@prisma/client";

import Header from "components/molecules/Header";
import { Xlf } from "components/molecules/Xlf";

interface ArticleProps {
  initial: {
    article: Article;
    xlf: string;
  };
}

const Home: FC<ArticleProps> = ({ initial: { article, xlf } }) => {
  return (
    <div className={"flex flex-col h-full w-full bg-zinc-600"}>
      <Header />
      <Xlf initialArticleXlf={xlf} initialArticle={article} />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  params: { id },
}) => {
  const prisma = new PrismaClient();
  const article = await prisma.article.findUnique({
    where: { id: +id },
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
  return {
    props: { initial: { article: JSON.parse(JSON.stringify(article)), xlf } },
  };
};

export default Home;
