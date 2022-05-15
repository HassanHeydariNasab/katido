import type {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  FC,
  PropsWithChildren,
} from "react";

const variants = {
  contained:
    "px-8 py-2 text-lg text-white bg-emerald-600 rounded-md border-none transition-colors cursor-pointer hover:bg-emerald-500 active:bg-emerald-700 font-medium",
  outlined:
    "px-8 py-2 text-lg text-white bg-transparent border-emerald-600 border-solid rounded-md transition-colors cursor-pointer hover:bg-emerald-500 active:bg-emerald-700 font-medium",
};

type BaseButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;
interface ButtonProps extends BaseButtonProps {
  variant?: keyof typeof variants;
}
const Button: FC<PropsWithChildren<ButtonProps>> = ({
  children,
  variant = "contained",
  ...others
}) => {
  return (
    <button
      {...others}
      className={[variants[variant], others.className || ""].join(" ")}
    >
      {children}
    </button>
  );
};

export default Button;
