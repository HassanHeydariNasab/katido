import Link from "next/link";

import Button from "components/atoms/Button";

const Custom404 = () => {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <p className="m-4 font-bold text-zinc-100">Not Found!</p>
      <Link href={"/"}>
        <Button>&larr;Back to Home</Button>
      </Link>
    </div>
  );
};

export default Custom404;
