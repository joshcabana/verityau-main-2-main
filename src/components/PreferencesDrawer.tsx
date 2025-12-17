import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdvancedFilters } from "./AdvancedFilters";

interface Filters {
  verifiedOnly: boolean;
  activeRecently: boolean;
  heightRange?: [number, number];
  interests?: string[];
  values?: string[];
}

interface PreferencesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export const PreferencesDrawer = ({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: PreferencesDrawerProps) => {
  const handleToggle = (key: "verifiedOnly" | "activeRecently", checked: boolean) => {
    onFiltersChange({
      ...filters,
      [key]: checked,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Discovery Filters</SheetTitle>
          <SheetDescription>
            Customize who appears in your discovery feed
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="basic" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 mt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="verified">Verified Only</Label>
                <div className="text-sm text-muted-foreground">
                  Show only profiles with verified badges
                </div>
              </div>
              <Switch
                id="verified"
                checked={filters.verifiedOnly}
                onCheckedChange={(checked) => handleToggle("verifiedOnly", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="active">Active Recently</Label>
                <div className="text-sm text-muted-foreground">
                  Show only users active in the last 24 hours
                </div>
              </div>
              <Switch
                id="active"
                checked={filters.activeRecently}
                onCheckedChange={(checked) =>
                  handleToggle("activeRecently", checked)
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="mt-4">
            <AdvancedFilters
              heightRange={filters.heightRange || [150, 200]}
              interests={filters.interests || []}
              values={filters.values || []}
              onHeightChange={(range) =>
                onFiltersChange({ ...filters, heightRange: range })
              }
              onInterestsChange={(interests) =>
                onFiltersChange({ ...filters, interests })
              }
              onValuesChange={(values) =>
                onFiltersChange({ ...filters, values })
              }
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
