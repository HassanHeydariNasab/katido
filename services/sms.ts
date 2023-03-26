import { env } from "process";

import Kavenegar from "kavenegar";

let kavenegar = Kavenegar.KavenegarApi({ apikey: env.KAVENEGAR_API_KEY });

export async function sendVerificationCode(receptor: string, code: string) {
  return new Promise<boolean>((resolve) => {
    kavenegar.VerifyLookup(
      { receptor, token: code, template: env.KAVENEGAR_VERIFICATION_PATTERN },
      function (response, status) {
        console.log({ response, status });
        if (status === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    );
  });
}
