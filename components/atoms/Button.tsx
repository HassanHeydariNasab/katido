import type {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  FC,
  PropsWithChildren,
} from "react";

type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;
const Button: FC<PropsWithChildren<ButtonProps>> = ({
  children,
  ...others
}) => {
  return (
    <button
      {...others}
      className={
        "px-8 py-2 text-lg text-white bg-emerald-600 rounded-md border-none transition-colors cursor-pointer hover:bg-emerald-500 active:bg-emerald-700 " +
        (others.className || "")
      }
    >
      {children}
    </button>
  );
};

export default Button;
