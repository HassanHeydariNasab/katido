import { FC } from "react";
import type { GetServerSideProps } from "next";
import { PrismaClient } from "@prisma/client";
import type { Article } from "@prisma/client";
import ArticleCard from "components/molecules/ArticleCard";
import Header from "components/molecules/Header";

interface ArticleProps {
  article: Article;
}

const Home: FC<ArticleProps> = ({ article }) => {
  return (
    <div className={"w-full h-full"}>
      <Header />
      <h2 className="px-4 text-center text-zinc-200">{article.title}</h2>
      <div
        className="px-4 bg-zinc-300"
        dangerouslySetInnerHTML={{ __html: article.st }}
      ></div>
    </div>
  );
};

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async ({
  query: { id },
}) => {
  const article = await prisma.article.findUnique({
    where: { id: +id as number },
  });
  return { props: { article: JSON.parse(JSON.stringify(article)) } };
};

export default Home;
