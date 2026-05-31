import { useQuery } from "@tanstack/react-query";
import { fetchSuggestions } from "@/services/api";
import type { SuggestionsResponse } from "@/services/api";

export function useSuggestions() {
  const result = useQuery<SuggestionsResponse>({
    queryKey: ["suggestions"],
    queryFn: fetchSuggestions,
    staleTime: 300_000,
  });

  return result;
}
