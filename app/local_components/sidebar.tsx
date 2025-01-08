import { useFetcher } from "@remix-run/react";
import { Sheet } from "~/components/ui/sheet";
import { 
  SheetContent,
  SheetHeader,
  SheetTitle 
} from "~/components/ui/sheet";
import { useEffect } from "react";

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: {
    email: string;
    id: string;
  };
};

type Ranking = {
  id: string;
  sourceText: string;
  targetText: string;
  rankings: Record<string, number>;
  updatedAt: string;
};

type LoaderData = {
  rankings: Ranking[];
};

export default function Sidebar({ sidebarOpen, setSidebarOpen, user }: SidebarProps) {
  const fetcher = useFetcher<LoaderData>();

  useEffect(() => {
    if (fetcher.state === "idle" && !fetcher.data) {
      fetcher.load(`/history?session=${user.email}`);
    }
  }, [fetcher, user.email]);

  const rankings = fetcher.data?.rankings ?? [];

  return (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>History</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {fetcher.state === "loading" ? (
            <p className="text-sm text-gray-500">Loading rankings...</p>
          ) : rankings.length > 0 ? (
            <div className="space-y-4">
              {rankings.map((ranking) => (
                <div key={ranking.id} className="border-b pb-3">
                  <p className="text-sm font-medium truncate">{ranking.sourceText}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(ranking.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No rankings found</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}