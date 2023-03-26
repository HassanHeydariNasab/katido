import type { FC } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import Button from "components/atoms/Button";
import Input from "components/atoms/Input";
import { useVerifyOtpMutation } from "store/user/user.api";
import { userSlice } from "store/user/user.slice";

const Otp: FC = () => {
  const router = useRouter();
  const { phoneNumber, isUserExists } = router.query;

  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<{ otp: string; name?: string }>();

  const [verifyOtp] = useVerifyOtpMutation();

  const onSubmitCode = handleSubmit((data) => {
    const { otp, name } = data;
    verifyOtp({
      body: {
        phoneNumber: decodeURIComponent(phoneNumber as string),
        otp,
        name,
      },
    })
      .unwrap()
      .then(() => {
        router.replace({ pathname: "/" });
      })
      .catch(({ status }) => {
        if (status === 403) {
          setError("otp", { message: "Code is invalid" });
        }
      });
  });

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <form
        className="flex overflow-y-auto flex-col gap-8 justify-center items-center w-full h-full"
        onSubmit={onSubmitCode}
      >
        <p className="py-2 text-3xl font-bold text-center text-gray-600">
          Enter received code
        </p>
        <Input
          {...register("otp", { required: true })}
          label={"Code"}
          placeholder={"12345"}
          error={errors.otp?.message}
        />
        {!Boolean(+isUserExists) && (
          <Input
            {...register("name", { required: true })}
            label={"You Name"}
            placeholder={"Ali"}
            error={errors.name?.message}
          />
        )}
        <Button type="submit">Continue &rarr;</Button>
      </form>
    </>
  );
};

export default Otp;
