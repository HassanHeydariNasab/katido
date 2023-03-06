import type { FC, MouseEventHandler } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectorProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}

const Selector: FC<SelectorProps> = ({ value, options, onChange }) => {
  const onClickOption: MouseEventHandler<HTMLDivElement> = (event) => {
    const newValue = event.currentTarget.dataset.value;
    onChange(newValue);
  };

  return (
    <div className="relative">
      <div
        className={
          "overflow-hidden absolute top-0 rounded-md shadow-sm animate-fade-in bg-zinc-700 text-zinc-50"
        }
      >
        {options.map((option) => (
          <div
            onClick={onClickOption}
            data-value={option.value}
            className={`${
              option.value === value ? "bg-slate-600" : "white"
            } px-4 py-2 hover:bg-slate-500 transition-colors`}
            key={option.value}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

Selector.displayName = "Selector";

export default Selector;
