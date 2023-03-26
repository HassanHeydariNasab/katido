import { useEffect, useState } from "react";
import type { FC, MouseEventHandler } from "react";
import type { Article, Phrase } from "@prisma/client";
import { SentenceTokenizer } from "natural";
import { useForm } from "react-hook-form";
import type { FieldValues, UseFormRegister } from "react-hook-form";
import axios from "axios";

import Button from "components/atoms/Button";
import {
  useGetArticleQuery,
  useGetArticleXlfQuery,
  useReplaceArticleXlfMutation,
  useTranslatePhraseMutation,
} from "store/article/article.api";
import Selector from "components/atoms/Selector";

const exportFormats = ["txt", "pdf", "odt", "docx"] as const;

type ExportFormat = (typeof exportFormats)[number];

const exportFormatsWithLabel = exportFormats.map((exportFormat) => ({
  value: exportFormat,
  label: exportFormat.toUpperCase(),
}));

interface Unit {
  seq: number;
  st: string;
  tt: string;
}
export const Xlf: FC<{
  initialArticleXlf: string;
  initialArticle: Article;
}> = ({ initialArticleXlf, initialArticle }) => {
  const [units, setUnits] = useState<Unit[] | null>(null);
  const [isExportFormatsOpen, setIsExportFormatsOpen] =
    useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("odt");

  const [replaceArticleXlf] = useReplaceArticleXlfMutation();
  const { data: _articleXlf } = useGetArticleXlfQuery({
    id: initialArticle.id,
  });
  const { data: _article } = useGetArticleQuery({ id: initialArticle.id });
  const [translatePhrase] = useTranslatePhraseMutation();

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

  const { register, handleSubmit, setValue } = useForm();

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
    axios
      .get(`/api/articles/${initialArticle.id}/export?format=${exportFormat}`, {
        responseType: "blob",
      })
      .then((response) => {
        console.log(response.data);
        const blob: Blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${initialArticle.title}.${exportFormat}`;
        a.click();
      });
  };

  const onClickToggleExportFormats: MouseEventHandler = (event) => {
    setIsExportFormatsOpen((open) => !open);
  };

  const onChangeExportFormat = (value: ExportFormat) => {
    setExportFormat(value);
  };

  const populateFieldWithMachineTranslation = (
    fieldName: string,
    st: string
  ) => {
    translatePhrase({
      body: { st, to: "fa", from: "en" },
    })
      .unwrap()
      .then(({ tt }) => {
        setValue(fieldName, tt);
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
        <Button type="submit">Save</Button>
        <div>
          <Button
            type="button"
            variant="outlined"
            onClick={onClickExport}
            className="rounded-r-none"
          >
            Export as {exportFormat.toUpperCase()}
          </Button>
          <Button
            type="button"
            variant="outlined"
            className="px-2 rounded-l-none border-l-0"
            onClick={onClickToggleExportFormats}
          >
            ⏷{" "}
            {isExportFormatsOpen && (
              <Selector
                value={exportFormat}
                options={exportFormatsWithLabel}
                onChange={onChangeExportFormat}
              />
            )}
          </Button>
        </div>
      </div>
      {units.map((unit) => (
        <UnitComponent
          unit={unit}
          register={register}
          populateFieldWithMachineTranslation={
            populateFieldWithMachineTranslation
          }
          key={unit.seq}
        />
      ))}
    </form>
  );
};

const UnitComponent: FC<{
  unit: Unit;
  register: UseFormRegister<FieldValues>;
  populateFieldWithMachineTranslation: (fieldName: string, st: string) => void;
}> = ({ unit, register, populateFieldWithMachineTranslation }) => {
  const [phrases, setPhrases] = useState<Partial<Phrase>[]>([]);

  useEffect(() => {
    const tokenizer = new SentenceTokenizer();
    const ttPhrases = tokenizer.tokenize(unit.tt);
    setPhrases(
      tokenizer
        .tokenize(unit.st)
        .map((sentence, index) => ({ st: sentence, tt: ttPhrases[index] }))
    );
  }, [unit.st, unit.tt]);

  const onClickTranslateByGoogle: MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    const phraseIndex = +event.currentTarget.dataset["index"];
    populateFieldWithMachineTranslation(
      `units.${unit.seq}.phrases.${phraseIndex}`,
      phrases[phraseIndex].st
    );
  };

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
              defaultValue={phrase.tt}
              className="p-2 w-full text-base text-white rounded-md bg-zinc-900"
              aria-multiline={"true"}
              dir="auto"
              data-index={index}
            />
            <Button
              className="mb-4"
              type="button"
              data-index={index}
              onClick={onClickTranslateByGoogle}
            >
              G
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
