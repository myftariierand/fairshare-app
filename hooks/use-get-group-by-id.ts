// hooks/use-create-group.ts
import { useQuery } from '@tanstack/react-query';
import { getGroupById } from '@/lib/groups';

export const useGetGroupById = (groupId: string) => {
  return useQuery({
    queryKey: ['groups', groupId],
    queryFn: () => getGroupById(groupId),
  });
};
