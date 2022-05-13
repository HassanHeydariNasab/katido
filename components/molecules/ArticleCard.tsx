import type { FC, MouseEventHandler } from "react";
import type { Article } from "@prisma/client";
import Link from "next/link";

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: FC<ArticleCardProps> = ({ article: { id, title } }) => {
  return (
    <Link href={`/articles/${id}`}>
      <div className="overflow-hidden p-4 w-72 h-56 rounded-lg cursor-pointer bg-zinc-300">
        <h3 className="text-xl font-medium">{title}</h3>
      </div>
    </Link>
  );
};

export default ArticleCard;
