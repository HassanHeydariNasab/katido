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
      className={"border-2 px-2 rounded-md " + others.className}
    >
      {children}
    </button>
  );
};

export default Button;
