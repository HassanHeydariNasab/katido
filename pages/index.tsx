import type { FC } from "react";
import type { GetServerSideProps } from "next";
import { PrismaClient } from "@prisma/client";
import type { Article } from "@prisma/client";
import ArticleCard from "components/ArticleCard";
import { useGetCurrentUserQuery } from "store/user/user.api";
import { useTypedSelector } from "store/store";

interface HomeProps {
  articles: Article[];
}

const Home: FC<HomeProps> = ({ articles }) => {
  const { token } = useTypedSelector((state) => state.userSlice);
  const { data: user } = useGetCurrentUserQuery(undefined, { skip: !token });
  return (
    <div className={"w-full h-full"}>
      <header>{user ? `Hi ${user.name}` : ""}</header>
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
  return { props: { articles } };
};

export default Home;
