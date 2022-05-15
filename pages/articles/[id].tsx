import { readFile } from "node:fs/promises";
import { cwd } from "node:process";
import { MouseEventHandler, useEffect, useState } from "react";
import type { FC } from "react";
import type { GetServerSideProps } from "next";
import { Phrase, PrismaClient } from "@prisma/client";
import type { Article } from "@prisma/client";
import { SentenceTokenizer } from "natural";
import Header from "components/molecules/Header";
import { FieldValues, useForm, UseFormRegister } from "react-hook-form";
import Button from "components/atoms/Button";
import {
  useGetArticleQuery,
  useGetArticleXlfQuery,
  useReplaceArticleXlfMutation,
  useUpdateArticleMutation,
} from "store/article/article.api";
import axios from "axios";

interface Unit {
  seq: number;
  st: string;
  tt: string;
}

const Xlf: FC<{ initialArticleXlf: string; initialArticle: Article }> = ({
  initialArticleXlf,
  initialArticle,
}) => {
  const [units, setUnits] = useState<Unit[] | null>(null);

  const [replaceArticleXlf] = useReplaceArticleXlfMutation();
  const { data: _articleXlf } = useGetArticleXlfQuery({
    id: initialArticle.id,
  });
  const { data: _article } = useGetArticleQuery({ id: initialArticle.id });

  const article = _article ? _article : initialArticle;
  const articleXlf = _articleXlf ? _articleXlf.xlf : initialArticleXlf;

  useEffect(() => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(articleXlf, "text/xml");
    const _units = xml.getElementsByTagName("trans-unit");
    const units: Unit[] = [];
    for (let i = 0; i < _units.length; i++) {
      const _unit = _units[i];
      const st = _unit.querySelector("source")?.textContent || "";
      const tt = _unit.querySelector("target")?.textContent || "";
      units.push({
        seq: i,
        st,
        tt,
      });
    }
    setUnits(units);
  }, [articleXlf]);

  const { register, handleSubmit } = useForm();

  const onSubmit = handleSubmit((data: { units: { phrases: string[] }[] }) => {
    console.log({ data });
    const parser = new DOMParser();
    const xml = parser.parseFromString(articleXlf, "text/xml");
    const _units = xml.getElementsByTagName("trans-unit");
    for (let i = 0; i < _units.length; i++) {
      const _unit = _units[i];
      _unit.setAttribute("approved", "yes");
      let target = _unit.querySelector("target");
      if (target === null) {
        target = document.createElementNS(
          "urn:oasis:names:tc:xliff:document:1.1",
          "target"
        );
        _unit.appendChild(target);
      }
      target.textContent = data.units[i].phrases.join(" ");
      target.setAttribute("state", "final");
    }
    const serializer = new XMLSerializer();
    const newXlf = serializer.serializeToString(xml);
    replaceArticleXlf({ id: initialArticle.id, body: { xlf: newXlf } });
  });

  const onClickExport: MouseEventHandler = (event) => {
    const format = "odt";
    axios
      .get(`/api/articles/${initialArticle.id}/export?format=${format}`, {
        responseType: "blob",
      })
      .then((response) => {
        console.log(response.data);
        const blob: Blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${initialArticle.title}.${format}`;
        a.click();
      });
  };

  if (units === null) {
    return undefined;
  }
  return (
    <form
      onSubmit={onSubmit}
      className="flex overflow-x-hidden overflow-y-scroll relative flex-col flex-1 gap-4 px-4"
    >
      <h2 className="px-4 text-center text-zinc-200">{article.title}</h2>
      <div className="flex flex-row gap-4">
        <Button type={"submit"}>Save</Button>
        <Button type="button" variant="outlined" onClick={onClickExport}>
          Export
        </Button>
      </div>
      {units.map((unit) => (
        <UnitComponent unit={unit} register={register} key={unit.seq} />
      ))}
    </form>
  );
};

const UnitComponent: FC<{
  unit: Unit;
  register: UseFormRegister<FieldValues>;
}> = ({ unit, register }) => {
  const [phrases, setPhrases] = useState<Partial<Phrase>[]>([]);

  useEffect(() => {
    const tokenizer = new SentenceTokenizer();
    setPhrases(
      tokenizer.tokenize(unit.st).map((sentence) => ({ st: sentence, tt: "" }))
    );
  }, []);

  return (
    <div className="p-2 rounded-lg bg-zinc-800">
      <p dir="auto" className="p-4 text-zinc-300">
        {unit.st}
      </p>
      <p dir="auto" className="p-4 text-zinc-400">
        {unit.tt}
      </p>
      <div className="p-4 text-white rounded-lg bg-zinc-900">
        {phrases.map((phrase, index) => (
          <div key={index}>
            <p dir="auto">{phrase.st}</p>
            <textarea
              {...register(`units.${unit.seq}.phrases.${index}`)}
              className="p-2 w-full text-base text-white rounded-md bg-zinc-900"
              aria-multiline={"true"}
              dir="auto"
              data-index={index}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

interface ArticleProps {
  initial: {
    article: Article;
    xlf: string;
  };
}

const Home: FC<ArticleProps> = ({ initial: { article, xlf } }) => {
  return (
    <div className={"flex flex-col h-full bg-zinc-600"}>
      <Header />
      <Xlf initialArticleXlf={xlf} initialArticle={article} />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  params: { id },
  res,
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
