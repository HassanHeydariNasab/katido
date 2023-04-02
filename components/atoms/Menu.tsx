import { Fragment } from "react";
import type { MouseEventHandler } from "react";
import { Menu, Transition } from "@headlessui/react";
import { IoChevronDown } from "react-icons/io5";

interface Item {
  onClick?: MouseEventHandler;
  label: string;
}

interface MenuProps {
  label: string;
  items: Item[];
}

const _Menu = ({ label, items }: MenuProps) => {
  return (
    <Menu>
      <div className="relative w-fit">
        <Menu.Button className="relative w-full h-full pl-8 pr-16 py-2 text-lg text-white bg-emerald-600 rounded-md border-none transition-colors cursor-pointer hover:bg-emerald-500 active:bg-emerald-700 font-medium">
          <span className="block truncate text-center">{label}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <IoChevronDown className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
        </Menu.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Menu.Items
            as="ul"
            className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white px-0 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          >
            {items.map((item, index) => (
              <Menu.Item
                as="li"
                key={index}
                onClick={item.onClick}
                className="relative cursor-pointer select-none py-2 px-4 list-none text-gray-900 border-0 border-b border-b-gray-200 border-solid hover:bg-emerald-200 last:border-b-0"
              >
                {item.label}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition>
      </div>
    </Menu>
  );
};

Menu.displayName = "Menu";

export default _Menu;
