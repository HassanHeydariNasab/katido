import { Dispatch, SetStateAction, useEffect, useState } from "react";
import type { FC, MouseEventHandler } from "react";
import type { Article, Phrase } from "@prisma/client";
import { SentenceTokenizer } from "natural";
import { useForm } from "react-hook-form";
import type { FieldValues, UseFormRegister } from "react-hook-form";
import axios from "axios";

import {
  useGetArticleQuery,
  useGetArticleXlfQuery,
  useReplaceArticleXlfMutation,
  useTranslatePhraseMutation,
} from "store/article/article.api";
import { Menu, Button } from "components/atoms";

const exportFormats = ["txt", "pdf", "odt", "docx"] as const;

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

  const exportFormatItems = exportFormats.map((exportFormat) => ({
    value: exportFormat,
    label: "Export As " + exportFormat.toUpperCase(),
    onClick: () => onClickExportFormat(exportFormat),
  }));

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

  const onClickExportFormat = (value: string) => {
    axios
      .get(`/api/articles/${initialArticle.id}/export?format=${value}`, {
        responseType: "blob",
      })
      .then((response) => {
        console.log(response.data);
        const blob: Blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${initialArticle.title}.${value}`;
        a.click();
      });
  };

  const populateFieldWithMachineTranslation = (
    fieldName: string,
    st: string,
    setIsLoading: Dispatch<SetStateAction<boolean>>
  ) => {
    setIsLoading(true);
    translatePhrase({
      body: { st, to: "fa", from: "en" },
    })
      .unwrap()
      .then(({ tt }) => {
        setValue(fieldName, tt);
      })
      .finally(() => {
        setIsLoading(false);
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
        <Menu label="Export" items={exportFormatItems} />
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

interface UnitComponentProps {
  unit: Unit;
  register: UseFormRegister<FieldValues>;
  populateFieldWithMachineTranslation: (
    fieldName: string,
    st: string,
    setIsLoading: Dispatch<SetStateAction<boolean>>
  ) => void;
}

const UnitComponent: FC<UnitComponentProps> = ({
  unit,
  register,
  populateFieldWithMachineTranslation,
}) => {
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

  return (
    <div className="p-2 rounded-lg bg-zinc-800">
      <p dir="auto" className="p-4 text-zinc-300">
        {unit.st}
      </p>
      <p dir="auto" className="p-4 text-zinc-400">
        {unit.tt}
      </p>
      <div className="p-4 text-white rounded-lg bg-zinc-900">
        {phrases.map((phrase, phraseIndex) => (
          <PhraseComponent
            key={phraseIndex}
            phraseIndex={phraseIndex}
            phrase={phrase}
            unit={unit}
            register={register}
            populateFieldWithMachineTranslation={
              populateFieldWithMachineTranslation
            }
          />
        ))}
      </div>
    </div>
  );
};

interface PhraseComponentProps extends UnitComponentProps {
  phraseIndex: number;
  phrase: Partial<Phrase>;
}

const PhraseComponent: FC<PhraseComponentProps> = ({
  phraseIndex,
  phrase,
  unit,
  register,
  populateFieldWithMachineTranslation,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onClickTranslateByGoogle: MouseEventHandler<HTMLButtonElement> = (
    event
  ) => {
    populateFieldWithMachineTranslation(
      `units.${unit.seq}.phrases.${phraseIndex}`,
      phrase.st,
      setIsLoading
    );
  };

  return (
    <div>
      <p dir="auto">{phrase.st}</p>
      <textarea
        {...register(`units.${unit.seq}.phrases.${phraseIndex}`)}
        defaultValue={phrase.tt}
        className={`p-2 w-full text-base text-white rounded-md bg-zinc-900 ${
          isLoading ? "bg-zinc-400" : ""
        }`}
        aria-multiline={"true"}
        dir="auto"
      />
      <Button className="mb-4" type="button" onClick={onClickTranslateByGoogle}>
        G
      </Button>
    </div>
  );
};
