import axios from "axios";
import type { FC, ChangeEventHandler } from "react";
import { useGetCurrentUserQuery } from "store/user/user.api";

const Header: FC = () => {
  const { data: user } = useGetCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const onChangeFile: ChangeEventHandler<HTMLInputElement> = (event) => {
    const file: File = (event.currentTarget as any).files[0];
    const formData = new FormData();
    formData.append("file", file, file.name);
    axios.postForm("/api/articles", formData);
  };
  return (
    <header className="flex gap-1 items-center p-4 text-white bg-zinc-700">
      {user && (
        <span className="py-1 px-2 rounded-md border-solid border-[1px] border-zinc-500">
          {user.coins} Coin{user.coins !== 1 && "s"}
        </span>
      )}
      <label>
        <span className="px-3 py-1 text-white bg-emerald-600 rounded-md border-none transition-colors cursor-pointer hover:bg-emerald-500 active:bg-emerald-700">
          Upload
        </span>
        <input type="file" className="hidden" onChange={onChangeFile} />
      </label>
    </header>
  );
};

export default Header;
