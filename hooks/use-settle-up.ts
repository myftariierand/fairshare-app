// hooks/use-settle-group.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settleUp } from '@/lib/groups';

export const useSettleUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settleUp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};
