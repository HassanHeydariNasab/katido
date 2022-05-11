import {
  DetailedHTMLProps,
  FC,
  forwardRef,
  InputHTMLAttributes,
  PropsWithChildren,
} from "react";

type HTMLInputProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

interface InputProps extends HTMLInputProps {
  label?: string;
  error?: string;
}

const Input: FC<PropsWithChildren<InputProps>> = forwardRef(
  ({ children, label, error, ...others }, ref) => {
    return (
      <label>
        <span className="mx-1 capitalize text-zinc-200">{label}</span>
        <br />
        <input
          {...others}
          ref={ref}
          className={
            "p-2 mt-1 text-lg rounded-md border-2 border-solid transition-colors text-zinc-300 border-zinc-700 bg-zinc-900 hover:border-emerald-600 focus-visible:border-emerald-600 placeholder:text-zinc-700 " +
            (others.className || "")
          }
        >
          {children}
        </input>
        {error && <div className="p-2 text-red-400">{error}</div>}
      </label>
    );
  }
);

export default Input;
