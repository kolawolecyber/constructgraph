import { Network } from "lucide-react";

interface AppHeaderProps {
  title: string;
  description: string;
}

export function AppHeader({
  title,
  description,
}: AppHeaderProps) {
  return (
    <header className="flex min-h-16 items-center justify-between border-b border-border bg-background px-4 md:px-8">
      <div className="flex items-center gap-3 md:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Network className="h-5 w-5" />
        </div>

        <span className="font-semibold">
          ConstructGraph
        </span>
      </div>

      <div className="hidden md:block">
        <h1 className="text-lg font-semibold tracking-tight">
          {title}
        </h1>

        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="ml-auto hidden text-right sm:block">
        <p className="text-sm font-medium">
          Graph Intelligence
        </p>

        <p className="text-xs text-muted-foreground">
          CognoDB powered
        </p>
      </div>
    </header>
  );
}