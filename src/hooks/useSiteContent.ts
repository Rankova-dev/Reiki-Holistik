import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contentApi } from "@/lib/contentApi";

export function useSiteContent<T>(key: string, fallback: T) {
  const { data, isLoading } = useQuery({
    queryKey: ["site-content", key],
    queryFn: async () => {
      try {
        return (await contentApi.getContent(key)) as Partial<T>;
      } catch {
        return null;
      }
    },
  });

  const content: T = data ? { ...fallback, ...data } : fallback;
  return { content, isLoading };
}

export function useSaveSiteContent(key: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (value: unknown) => {
      await contentApi.saveContent(key, value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-content", key] });
    },
  });
}
