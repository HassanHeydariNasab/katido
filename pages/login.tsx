import type { FC } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Input from "components/atoms/Input";
import Button from "components/atoms/Button";
import { useRequestOtpMutation } from "store/user/user.api";

interface LoginProps {}

const Login: FC<LoginProps> = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<{ email: string }>();

  const [requestOtp, { isLoading }] = useRequestOtpMutation();

  const onSubmitEmail = handleSubmit((data) => {
    const { email } = data;
    requestOtp({ body: { email } })
      .unwrap()
      .then(({ isUserExists }) => {
        router.push(
          {
            pathname: "/otp",
            query: `email=${email}&isUserExists=${isUserExists ? 1 : 0}`,
          },
          { pathname: "/otp" }
        );
      });
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
        <Input
          {...register("email", { required: true })}
          label={"Email"}
          placeholder={"name@mail.com"}
          error={errors.email?.message}
        />
        <Button type="submit">Continue &rarr;</Button>
      </form>
    </>
  );
};

export default Login;
