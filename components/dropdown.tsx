import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DropdownData } from "@/interface";
import { cn } from "@/lib/utils";

interface DropdownComponentProps {
  datas: DropdownData[];
  hint: string;
  placeholder: string;
  notfound: string;
  popoverWidth?: string;
  selectedValue?: number | string;
  onSelect?: (value: number | string) => void;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownComponentProps> = ({
  datas,
  hint,
  placeholder,
  notfound,
  popoverWidth,
  selectedValue,
  disabled,
  onSelect,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls="dropdown-listbox"
          className="w-full justify-between text-sm h-10 px-3 py-1"
          disabled={disabled}
        >
          {selectedValue
            ? datas.find((data) => data.value === selectedValue)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command className="w-full">
          <CommandInput className="text-sm" placeholder={hint} />
          <CommandList id="dropdown-listbox" role="listbox">
            <CommandEmpty>{notfound}</CommandEmpty>
            <CommandGroup>
              {datas.map((data) => (
                <CommandItem
                  key={data.value}
                  value={`${data.value}`}
                  onSelect={() => {
                    if (onSelect) onSelect(data.value);
                    setOpen(false);
                  }}
                  aria-selected={selectedValue === data.value}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValue === data.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {data.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default Dropdown;
