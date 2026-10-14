import { useCallback, useMemo, useRef, useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import ReorderableList, {
  reorderItems,
  useReorderableDrag,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list';

import {
  useGetTasks,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useReorderTasksMutation,
  useDeleteTaskMutation,
} from '@/services/tasks';
import { useGroupIdParam } from '@/hooks/use-group-id-param';
import { useAuthUser } from '@/lib/auth-context';

import { cn } from '@/lib/utils';

import type { Task } from '@/services/tasks';

import {
  GripVerticalIcon,
  NotebookIcon,
  SquareCheckIcon,
  SquareIcon,
  TrashIcon,
} from 'lucide-react-native';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
const isTempId = (id: string) => id.startsWith('temp-');

const TaskRow = ({ item, groupId, userId }: { item: Task; groupId: string; userId: string }) => {
  const drag = useReorderableDrag();
  const updateTask = useUpdateTaskMutation();
  const deleteTask = useDeleteTaskMutation();
  const isTemp = isTempId(item.id);

  return (
    <View className="flex-row items-center gap-3 rounded-md px-3 py-2">
      <Pressable
        onPress={() => updateTask.mutate({ groupId, taskId: item.id, done: !item.done })}
        disabled={isTemp}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.done, disabled: isTemp }}>
        {item.done ? <Icon as={SquareCheckIcon} /> : <Icon as={SquareIcon} />}
      </Pressable>

      <View className="flex-1">
        <Text className={cn(item.done && 'text-muted-foreground line-through')}>{item.text}</Text>
        <Text variant={'muted'}>{userId === item.createdBy.id ? 'You' : item.createdBy.name}</Text>
      </View>

      <Pressable
        onPress={() => deleteTask.mutate({ taskId: item.id, groupId })}
        disabled={isTemp}
        hitSlop={8}>
        <Icon as={TrashIcon} size={16} />
      </Pressable>

      <Pressable
        onPressIn={drag}
        disabled={item.done || isTemp}
        hitSlop={8}
        className={cn((item.done || isTemp) && 'opacity-30')}>
        <Icon as={GripVerticalIcon} />
      </Pressable>
    </View>
  );
};

export default function NotesList() {
  const inputRef = useRef<TextInput>(null);
  const [inputValue, setInputValue] = useState('');

  const user = useAuthUser();
  const { groupId } = useGroupIdParam();

  const { data: items = [] } = useGetTasks(groupId);
  const addTask = useAddTaskMutation();
  const { mutate: reorderTasks } = useReorderTasksMutation();

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => Number(a.done) - Number(b.done)),
    [items]
  );

  // keep the order override from before: it holds the user's order while requests are in flight
  const [orderOverride, setOrderOverride] = useState<string[] | null>(null);
  const inFlight = useRef(0);

  const displayItems = useMemo(() => {
    if (!orderOverride) return sortedItems;
    const rank = (id: string) => orderOverride.indexOf(id);
    return [...sortedItems].sort((a, b) => rank(a.id) - rank(b.id));
  }, [sortedItems, orderOverride]);

  const handleReorder = useCallback(
    ({ from, to }: ReorderableListReorderEvent) => {
      if (from === to) return;
      const next = reorderItems(displayItems, from, to);

      inFlight.current += 1;
      setOrderOverride(next.map((t) => t.id));

      reorderTasks(
        { groupId, orderedIds: next.map((t) => t.id).filter((id) => !isTempId(id)) },
        {
          onSettled: () => {
            inFlight.current -= 1;
            if (inFlight.current === 0) setOrderOverride(null);
          },
        }
      );
    },
    [displayItems, groupId, reorderTasks]
  );

  const handleAdd = () => {
    const text = inputValue.trim();
    if (!text) return;
    addTask.mutate({ groupId, text });
    setInputValue('');
    inputRef.current?.focus();
  };

  const renderItem = useCallback(
    ({ item }: { item: Task }) => <TaskRow item={item} groupId={groupId} userId={user.id} />,
    [groupId, user.id]
  );

  return (
    <ReorderableList
      data={displayItems}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onReorder={handleReorder}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <Input
          ref={inputRef}
          placeholder="Add a task, press enter"
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          submitBehavior="submit"
        />
      }
      ListEmptyComponent={
        <View className="mt-12 items-center gap-2">
          <Icon as={NotebookIcon} className="text-muted-foreground" />
          <Text variant={'muted'}>No Notes</Text>
        </View>
      }
    />
  );
}
