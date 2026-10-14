import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import {
  getGroupById,
  createGroup,
  settleUp,
  removeMember,
  updateGroup,
  createExpense,
  getExpenseById,
  deleteExpense,
  updateExpense,
  deleteGroup,
} from '@/lib/groups'

export const useGetGroupById = (groupId: string) => {
  return useQuery({
    queryKey: ['groups', groupId],
    queryFn: () => getGroupById(groupId),
  })
}

export const useCreateGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export const useUpdateGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateGroup,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['groups', id] })
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export const useDeleteGroup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteGroup,
    onSuccess: async (_, id) => {
      queryClient.removeQueries({ queryKey: ['groups', id] })
      await queryClient.invalidateQueries({ queryKey: ['groups'], exact: true })
    },
  })
}

export const useRemoveMember = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeMember,
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
    },
  })
}

export const useSettleUp = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: settleUp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export const useGetExpenseById = (id: string) => {
  return useQuery({
    queryKey: ['expenses', id],
    queryFn: () => getExpenseById(id),
  })
}

export const useCreateExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createExpense,
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
    },
  })
}

export const useUpdateExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateExpense,
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
    },
  })
}

export const useDeleteExpense = () => {
  return useMutation({
    mutationFn: deleteExpense,
  })
}
