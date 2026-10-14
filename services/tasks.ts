// services/task.ts
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api'; // your axios instance

export interface Task {
  id: string;
  text: string;
  done: boolean;
  position: number;
  groupId: string;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
  };
}

export const tasksKey = (groupId: string) => ['tasks', groupId] as const;

export async function getTasks(groupId: string) {
  const { data } = await api.get<Task[]>(`/groups/${groupId}/tasks`);
  return data;
}

export const useGetTasks = (groupId: string) => {
  return useQuery({
    queryKey: tasksKey(groupId),
    queryFn: () => getTasks(groupId),
  });
};

type AddTaskVars = { groupId: string; text: string };

const addTaskRequest = async ({ groupId, text }: AddTaskVars) => {
  const { data } = await api.post<Task>(`/groups/${groupId}/tasks`, { text });
  return data;
};

export const useAddTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTaskRequest,

    onMutate: async ({ groupId, text }) => {
      const key = tasksKey(groupId);

      // stop in-flight refetches from overwriting the optimistic item
      await queryClient.cancelQueries({ queryKey: key });

      const tempId = `temp-${Date.now()}`;

      queryClient.setQueryData<Task[]>(key, (old = []) => [
        {
          id: tempId,
          text,
          done: false,
          position: (old[0]?.position ?? 0) - 1,
          groupId,
          createdById: 'me',
          createdBy: { id: 'me', name: 'Me' },
        },
        ...old,
      ]);

      return { tempId };
    },

    onSuccess: (created, { groupId }, ctx) => {
      queryClient.setQueryData<Task[]>(tasksKey(groupId), (old = []) =>
        old.map((t) => (t.id === ctx.tempId ? created : t))
      );
    },

    onError: (_err, { groupId }, ctx) => {
      if (!ctx) return;
      // remove only the temp item, so concurrent updates aren't clobbered
      queryClient.setQueryData<Task[]>(tasksKey(groupId), (old = []) =>
        old.filter((t) => t.id !== ctx.tempId)
      );
    },
  });
};

// services/task.ts (continued)

const sortByIds = (tasks: Task[], ids: string[]) => {
  const rank = (id: string) => {
    const i = ids.indexOf(id);
    return i === -1 ? Infinity : i; // unknown items (e.g. added mid-flight) go last
  };
  return [...tasks].sort((a, b) => rank(a.id) - rank(b.id));
};

/* ---------- update ---------- */

type UpdateTaskVars = {
  groupId: string;
  taskId: string;
  text?: string;
  done?: boolean;
};

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, taskId, ...body }: UpdateTaskVars) => {
      const { data } = await api.patch<Task>(`/groups/${groupId}/tasks/${taskId}`, body);
      return data;
    },

    onMutate: async ({ groupId, taskId, ...changes }) => {
      const key = tasksKey(groupId);
      await queryClient.cancelQueries({ queryKey: key });

      // remember only the fields we're about to change
      const previous = queryClient.getQueryData<Task[]>(key)?.find((t) => t.id === taskId);
      const previousFields = previous
        ? (Object.fromEntries(
            Object.keys(changes).map((k) => [k, previous[k as keyof Task]])
          ) as Partial<Task>)
        : undefined;

      queryClient.setQueryData<Task[]>(key, (old = []) =>
        old.map((t) => (t.id === taskId ? { ...t, ...changes } : t))
      );

      return { previousFields };
    },

    onError: (_err, { groupId, taskId }, ctx) => {
      if (!ctx?.previousFields) return;
      queryClient.setQueryData<Task[]>(tasksKey(groupId), (old = []) =>
        old.map((t) => (t.id === taskId ? { ...t, ...ctx.previousFields } : t))
      );
    },
  });
};

/* ---------- reorder ---------- */

type ReorderTasksVars = { groupId: string; orderedIds: string[] };

export const useReorderTasksMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, orderedIds }: ReorderTasksVars) => {
      const { data } = await api.put<Task[]>(`/groups/${groupId}/tasks/reorder`, { orderedIds });
      return data;
    },

    onMutate: async ({ groupId, orderedIds }) => {
      const key = tasksKey(groupId);

      const previousIds = (queryClient.getQueryData<Task[]>(key) ?? []).map((t) => t.id);

      // update the cache first, so there's no window where it lags behind the UI
      queryClient.setQueryData<Task[]>(key, (old = []) => sortByIds(old, orderedIds));

      await queryClient.cancelQueries({ queryKey: key });

      return { previousIds };
    },

    onSettled: (_data, _err, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: tasksKey(groupId) });
    },

    onError: (_err, { groupId }, ctx) => {
      if (!ctx) return;
      queryClient.setQueryData<Task[]>(tasksKey(groupId), (old = []) =>
        sortByIds(old, ctx.previousIds)
      );
    },
  });
};

/* ---------- delete ---------- */

type DeleteTaskVars = { groupId: string; taskId: string };

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, taskId }: DeleteTaskVars) => {
      await api.delete(`/groups/${groupId}/tasks/${taskId}`);
    },

    onMutate: async ({ groupId, taskId }) => {
      const key = tasksKey(groupId);
      await queryClient.cancelQueries({ queryKey: key });

      const old = queryClient.getQueryData<Task[]>(key) ?? [];
      const index = old.findIndex((t) => t.id === taskId);
      const removed = index === -1 ? undefined : old[index];

      queryClient.setQueryData<Task[]>(key, (cur = []) => cur.filter((t) => t.id !== taskId));

      return { removed, index };
    },

    onError: (_err, { groupId, taskId }, ctx) => {
      if (!ctx?.removed) return;
      queryClient.setQueryData<Task[]>(tasksKey(groupId), (cur = []) => {
        if (cur.some((t) => t.id === taskId)) return cur;
        const next = [...cur];
        next.splice(Math.min(ctx.index, next.length), 0, ctx.removed!);
        return next;
      });
    },
  });
};
