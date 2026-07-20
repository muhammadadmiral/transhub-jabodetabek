import { useRouteSearchForm } from "../hooks/useRouteSearchForm";
import { SearchPanel } from "./SearchPanel";

export function RouteSearch() {
  const form = useRouteSearchForm();
  return <SearchPanel {...form} />;
}
