import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Resume } from "../backend";
import { useActor } from "./useActor";

export function useAllResumes() {
  const { actor, isFetching } = useActor();
  return useQuery<Resume[]>({
    queryKey: ["resumes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllResumes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetResume(index: number | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Resume>({
    queryKey: ["resume", index],
    queryFn: async () => {
      if (!actor || index === undefined) throw new Error("No actor or index");
      return actor.getResume(BigInt(index));
    },
    enabled: !!actor && !isFetching && index !== undefined,
  });
}

export function useCreateResume() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (resume: Resume) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createResume(resume);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
}

export function useUpdateResume() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      index,
      resume,
    }: { index: number; resume: Resume }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateResume(BigInt(index), resume);
    },
    onSuccess: (_, { index }) => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["resume", index] });
    },
  });
}

export function useDeleteResume() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (index: number) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteResume(BigInt(index));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      successUrl,
      cancelUrl,
    }: {
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      const items = [
        {
          productName: "Resume Builder Premium",
          currency: "usd",
          quantity: BigInt(1),
          priceInCents: BigInt(999),
          productDescription:
            "Unlock PDF export and premium resume templates forever.",
        },
      ];
      return actor.createCheckoutSession(items, successUrl, cancelUrl);
    },
  });
}
