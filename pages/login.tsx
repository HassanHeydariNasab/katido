import Head from "next/head";
import type { FC } from "react";
import { useForm } from "react-hook-form";

interface LoginProps {}

const Login: FC<LoginProps> = () => {
  const { register, handleSubmit } = useForm<{ email: string }>();

  const onSubmitEmail = handleSubmit((data) => {
    console.log({ data });
  });

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <form
        className="flex overflow-y-auto flex-col gap-8 justify-center items-center w-full h-full"
        onSubmit={onSubmitEmail}
      >
        <p className="py-2 text-3xl font-bold text-center text-gray-600">
          Enter your email
        </p>
        <input
          {...register("email", { required: true })}
          placeholder={"email"}
        />
        <button type="submit">Continue &rarr;</button>
      </form>
    </>
  );
};

export default Login;
