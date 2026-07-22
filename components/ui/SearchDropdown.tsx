
"use client";

import { useImperativeHandle } from "react";


import {
  forwardRef,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import TextInput from "./TextInput";

type SearchDropdownProps<T> = {
  label?: string;
  placeholder?: string;

  items: T[];

  value: string;

  onChange: (value: string) => void;

  onSelect: (item: T) => void;

  getLabel: (item: T) => string;

  nextRef?: React.RefObject<HTMLElement | null>;
};

function SearchDropdownInner<T>(
  {
    label,
    placeholder,
    items,
    value,
    onChange,
    onSelect,
    getLabel,
    nextRef,
  }: SearchDropdownProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>
) 
{
  const [open, setOpen] = useState(false);

  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  

useImperativeHandle(ref, () => inputRef.current!, []);


  const filteredItems = items.filter((item) =>
    getLabel(item)
      .toLowerCase()
      .includes(value.toLowerCase())
  );
    useEffect(() => {
    if (highlightedIndex >= filteredItems.length) {
      setHighlightedIndex(0);
    }
  }, [filteredItems.length, highlightedIndex]);

  useEffect(() => {
    if (!listRef.current) return;

    const element = listRef.current.children[
      highlightedIndex
    ] as HTMLElement;

    if (element) {
      element.scrollIntoView({
        block: "nearest",
      });
    }
  }, [highlightedIndex]);

  function handleKeyDown(
    e: KeyboardEvent<HTMLInputElement>
  ) {
    if (!open && e.key === "ArrowDown") {
      setOpen(true);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();

        setHighlightedIndex((prev) =>
          Math.min(prev + 1, filteredItems.length - 1)
        );

        break;

      case "ArrowUp":
        e.preventDefault();

        setHighlightedIndex((prev) =>
          Math.max(prev - 1, 0)
        );

        break;

      case "Escape":
        setOpen(false);
        break;

      case "Enter":
        e.preventDefault();

        if (
          open &&
          filteredItems.length > 0
        ) {
          const item =
            filteredItems[highlightedIndex];

          onSelect(item);

          setOpen(false);

          setHighlightedIndex(0);

          setTimeout(() => {
            nextRef?.current?.focus();
          }, 50);
        }

        break;
    }
  }
      return (
    <div className="relative">

      <TextInput
        ref={inputRef}
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={(text) => {
          onChange(text);
          setOpen(true);
          setHighlightedIndex(0);
        }}
        onKeyDown={handleKeyDown}
      />

      {open && filteredItems.length > 0 && (
        <div
          ref={listRef}
          className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-56 overflow-y-auto z-50"
        >
          {filteredItems.map((item, index) => (
            <div
              key={index}
              onMouseDown={() => {
                onSelect(item);

                setOpen(false);

                setHighlightedIndex(0);

                setTimeout(() => {
                  nextRef?.current?.focus();
                }, 50);
              }}
              className={`px-4 py-2 cursor-pointer ${
                highlightedIndex === index
                  ? "bg-green-100"
                  : "hover:bg-gray-100"
              }`}
            >
              {getLabel(item)}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

const SearchDropdown = forwardRef(
  SearchDropdownInner
) as <T>(
  props: SearchDropdownProps<T> & {
    ref?: React.Ref<HTMLInputElement>;
  }
) => React.JSX.Element;

export default SearchDropdown;