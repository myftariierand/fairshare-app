// hooks/use-create-group.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGroup } from '@/lib/groups';

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};
