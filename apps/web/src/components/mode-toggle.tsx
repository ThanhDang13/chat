import { Sun, Moon } from "lucide-react";
import { Button } from "@web/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@web/components/ui/dropdown-menu";
import { type Theme, useTheme } from "@web/components/theme-provider";
import { cn } from "@web/lib/utils";

export function ModeToggle({
  value,
  onChange,
  className
}: {
  value?: string;
  onChange?: (theme: string) => void;
  className?: string;
}) {
  const { setTheme } = useTheme();

  const handleSelect = (theme: Theme) => {
    setTheme(theme);
    onChange?.(theme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className={cn("relative", className)}>
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleSelect("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
