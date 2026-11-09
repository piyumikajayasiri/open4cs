"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import { ChevronDown, Check } from "lucide-react";

interface SelectContextType {
  value: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  selectedLabel: string;
  setSelectedLabel: (label: string) => void;
  disabled?: boolean;
}

const SelectContext = createContext<SelectContextType | null>(null);

export function useSelectContext() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a <Select>");
  }
  return context;
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
}

export function Select({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  children,
  disabled = false,
}: SelectProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleValueChange = (newVal: string) => {
    if (!isControlled) {
      setInternalValue(newVal);
    }
    if (onValueChange) {
      onValueChange(newVal);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        open,
        setOpen,
        selectedLabel,
        setSelectedLabel,
        disabled,
      }}
    >
      <div ref={containerRef} className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps {
  children?: ReactNode;
  className?: string;
  id?: string;
}

export function SelectTrigger({ children, className = "", id }: SelectTriggerProps) {
  const { open, setOpen, disabled } = useSelectContext();

  return (
    <button
      id={id}
      type="button"
      role="combobox"
      aria-expanded={open}
      disabled={disabled}
      onClick={() => !disabled && setOpen((prev) => !prev)}
      className={`flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 shadow-2xs outline-none transition hover:border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${className}`}
    >
      <div className="flex-1 text-left truncate mr-2">{children}</div>
      <ChevronDown
        className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
          open ? "rotate-180 text-blue-600" : ""
        }`}
      />
    </button>
  );
}

export interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder = "Select..." }: SelectValueProps) {
  const { value, selectedLabel } = useSelectContext();
  const display = selectedLabel || value || placeholder;

  return (
    <span className={!value && !selectedLabel ? "text-slate-400" : "text-slate-900 font-medium"}>
      {display}
    </span>
  );
}

export interface SelectContentProps {
  children: ReactNode;
  className?: string;
}

export function SelectContent({ children, className = "" }: SelectContentProps) {
  const { open } = useSelectContext();

  if (!open) return null;

  return (
    <div
      role="listbox"
      className={`absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 min-w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 text-slate-800 shadow-xl transition animate-in fade-in-0 zoom-in-95 ${className}`}
    >
      {children}
    </div>
  );
}

export interface SelectItemProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function SelectItem({ value, children, className = "" }: SelectItemProps) {
  const { value: selectedValue, onValueChange, setOpen, setSelectedLabel } =
    useSelectContext();
  const isSelected = selectedValue === value;

  useEffect(() => {
    if (isSelected && typeof children === "string") {
      setSelectedLabel(children);
    }
  }, [isSelected, children, setSelectedLabel]);

  const handleSelect = () => {
    if (typeof children === "string") {
      setSelectedLabel(children);
    }
    if (onValueChange) {
      onValueChange(value);
    }
    setOpen(false);
  };

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={handleSelect}
      className={`relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-xs sm:text-sm outline-none transition hover:bg-slate-100 ${
        isSelected
          ? "bg-blue-50 text-blue-700 font-semibold"
          : "text-slate-800 font-medium"
      } ${className}`}
    >
      <span className="truncate">{children}</span>
      {isSelected && (
        <Check className="h-4 w-4 shrink-0 text-blue-600 ml-2" />
      )}
    </div>
  );
}

/**
 * Shorthand Dropdown component matching ShadCN UI styling
 */
export interface ShadcnSelectOption {
  value: string;
  label?: string;
}

export interface ShadcnSelectProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: (string | ShadcnSelectOption)[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ShadcnSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  className = "",
  disabled = false,
}: ShadcnSelectProps) {
  const normalizedOptions: ShadcnSelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {normalizedOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label || opt.value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
