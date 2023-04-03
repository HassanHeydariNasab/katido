import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { IoCheckmark, IoChevronDown } from "react-icons/io5";

type Value = string | number | null;

interface Option<T> {
  value: T;
  label: string;
}

interface SelectorProps<T> {
  label?: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  containerClassName?: string;
}

const Selector = <T = Value,>({
  label,
  value,
  options,
  onChange,
  containerClassName,
}: SelectorProps<T>) => {
  return (
    <Listbox
      value={value}
      onChange={onChange}
      as="div"
      className={containerClassName}
    >
      <Listbox.Label className="font-medium text-gray-400">
        {label}
      </Listbox.Label>
      <div className="relative w-fit">
        <Listbox.Button className="relative w-full h-full pl-8 pr-12 py-2 text-lg text-white bg-emerald-600 rounded-md border-none transition-colors cursor-pointer hover:bg-emerald-500 active:bg-emerald-700 font-medium">
          <span className="block truncate text-center">
            {options.find((option) => option.value === value)?.label}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <IoChevronDown className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 px-0 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {options.map((option, index) => (
              <Listbox.Option
                key={index}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 list-none text-gray-900 ${
                    active ? "bg-emerald-100" : ""
                  }`
                }
                value={option.value}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {option.label}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-600">
                        <IoCheckmark className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

Selector.displayName = "Selector";

export default Selector;
