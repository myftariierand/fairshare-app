// lib/groups.ts
import { api } from './api';

import type { Group, SingleGroup, SingleTransaction } from '@/types/group';

export type CreateGroupInput = {
  name: string;
  currency: string;
  cover: {
    uri: string;
    fileName?: string | null;
    mimeType?: string | null;
    file?: File; // present on web
  } | null;
};

export async function getGroups() {
  const { data } = await api.get<Group[]>('/groups');
  return data;
}

export async function getGroupById(id: string) {
  const { data } = await api.get<SingleGroup>(`/groups/${id}`);
  return data;
}

export async function createGroup({ name, currency, cover }: CreateGroupInput) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('currency', currency);

  if (cover) {
    const ext = cover.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
    formData.append('cover', {
      uri: cover.uri,
      name: cover.fileName ?? `cover.${ext}`,
      type: cover.mimeType ?? (ext === 'png' ? 'image/png' : 'image/jpeg'),
    } as any);
  }

  const { data } = await api.post<Group>('/groups', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateGroup({
  id,
  name,
  currency,
  cover,
}: { id: string } & CreateGroupInput) {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('currency', currency);

  if (cover) {
    const ext = cover.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
    formData.append('cover', {
      uri: cover.uri,
      name: cover.fileName ?? `cover.${ext}`,
      type: cover.mimeType ?? (ext === 'png' ? 'image/png' : 'image/jpeg'),
    } as any);
  }

  const { data } = await api.patch<Group>(`/groups/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteGroup(id: string) {
  const { data } = await api.delete(`/groups/${id}`);
  return data;
}

type SettleUpInput = {
  groupId: string;
  amount: number;
  description: string;
  paidBy: string;
};

export async function settleUp(input: SettleUpInput) {
  const { data } = await api.post('/transactions/settle', input);
  return data;
}

type RemoveMemberInput = {
  groupId: string;
  memberId: string;
};

export async function removeMember({ groupId, memberId }: RemoveMemberInput) {
  const { data } = await api.delete(`/groups/${groupId}/remove/${memberId}`);
  return data;
}

export async function getExpenseById(id: string) {
  const { data } = await api.get<SingleTransaction>(`/transactions/single/${id}`);
  return data;
}

type CreateExpenseInput = {
  groupId: string;
  amount: number;
  description: string;
  paidBy: string;
  splits: { userId: string; amount: number }[];
};

export async function createExpense(input: CreateExpenseInput) {
  const { data } = await api.post('/transactions', input);
  return data;
}

type UpdateExpenseInput = { id: string } & CreateExpenseInput;

export async function updateExpense({ id, ...rest }: UpdateExpenseInput) {
  const { data } = await api.patch(`/transactions/${id}`, rest);
  return data;
}

export async function deleteExpense(id: string) {
  const { data } = await api.delete(`/transactions/${id}`);
  return data;
}
