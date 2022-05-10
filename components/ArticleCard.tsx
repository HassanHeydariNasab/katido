import type { FC } from "react";
import type { Article } from "@prisma/client";

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: FC<ArticleCardProps> = ({ article: { title, st, tt } }) => {
  return (
    <div className="flex-1 bg-slate-500">
      <h3 className="font-medium text-xl">{title}</h3>
      <p>{st}</p>
      <p>{tt}</p>
    </div>
  );
};

export default ArticleCard;
