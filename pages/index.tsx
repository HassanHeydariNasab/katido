import { FC } from "react";
import type { GetServerSideProps } from "next";
import { PrismaClient } from "@prisma/client";
import type { Article } from "@prisma/client";
import ArticleCard from "components/molecules/ArticleCard";
import Header from "components/molecules/Header";

interface HomeProps {
  articles: Article[];
}

const Home: FC<HomeProps> = ({ articles }) => {
  return (
    <div className={"w-full h-full"}>
      <Header />
      <h2>Articles</h2>
      {articles.map((article) => (
        <ArticleCard article={article} />
      ))}
    </div>
  );
};

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async () => {
  const articles = await prisma.article.findMany();
  return { props: { articles: JSON.parse(JSON.stringify(articles)) } };
};

export default Home;
