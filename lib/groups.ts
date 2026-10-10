// lib/groups.ts
import { api } from './api';

import type { Group, SingleGroup } from '@/types/group';

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
