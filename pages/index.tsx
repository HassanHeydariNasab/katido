import { FC } from "react";
import type { GetServerSideProps } from "next";
import type { Article } from "@prisma/client";

import ArticleCard from "components/molecules/ArticleCard";
import Header from "components/molecules/Header";
import prisma from "prisma/prisma";

interface HomeProps {
  articles: Article[];
}

const Home: FC<HomeProps> = ({ articles }) => {
  return (
    <div className={"w-full h-full"}>
      <Header />
      <h2 className="px-4 text-center text-zinc-200">Untranslated</h2>
      <div className="flex flex-wrap gap-8 justify-center px-4">
        {articles.map((article) => (
          <ArticleCard article={article} key={article.id} />
        ))}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const articles = await prisma.article.findMany();
  return { props: { articles: JSON.parse(JSON.stringify(articles)) } };
};

export default Home;
