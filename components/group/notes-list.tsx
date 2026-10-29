import { useCallback, useMemo, useRef, useState } from 'react'
import { View, TextInput, Pressable, type TextInputInstance } from 'react-native'
import ReorderableList, {
  reorderItems,
  useReorderableDrag,
  type ReorderableListReorderEvent,
} from 'react-native-reorderable-list'

import {
  useGetTasks,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useReorderTasksMutation,
  useDeleteTaskMutation,
} from '@/services/tasks'
import { useGroupIdParam } from '@/hooks/use-group-id-param'
import { useAuthUser } from '@/lib/auth-context'

import { cn } from '@/lib/utils'

import type { Task } from '@/services/tasks'

import {
  CheckIcon,
  GripVerticalIcon,
  NotebookIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react-native'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SectionLabel } from '@/components/ui/section-label'
import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { Empty } from '@/components/ui/empty'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
const isTempId = (id: string) => id.startsWith('temp-')

const TaskRow = ({ item, groupId, userId }: { item: Task; groupId: string; userId: string }) => {
  const drag = useReorderableDrag()
  const updateTask = useUpdateTaskMutation()
  const deleteTask = useDeleteTaskMutation()
  const isTemp = isTempId(item.id)

  return (
    <View className='border-border bg-background min-h-14 flex-row items-center gap-3 border-b py-2'>
      <Pressable
        onPress={() => updateTask.mutate({ groupId, taskId: item.id, done: !item.done })}
        disabled={isTemp}
        hitSlop={10}
        accessibilityRole='checkbox'
        accessibilityLabel={item.text}
        accessibilityState={{ checked: item.done, disabled: isTemp }}
        className={cn(
          'size-6 items-center justify-center rounded-md border-2',
          item.done ? 'bg-muted border-muted' : 'border-muted-foreground/60'
        )}
      >
        {item.done && <Icon as={CheckIcon} className='text-muted-foreground size-4' />}
      </Pressable>

      <View className='flex-1'>
        <Text className={cn(item.done && 'text-muted-foreground line-through')}>{item.text}</Text>
        <Text className='text-muted-foreground text-xs'>
          {userId === item.createdBy.id ? 'Added by you' : item.createdBy.name}
        </Text>
      </View>

      <Pressable
        onPress={() => deleteTask.mutate({ taskId: item.id, groupId })}
        disabled={isTemp}
        hitSlop={8}
        accessibilityRole='button'
        accessibilityLabel={`Delete ${item.text}`}
        className='size-9 items-center justify-center rounded-md active:opacity-60'
      >
        <Icon as={Trash2Icon} className='text-muted-foreground size-4' />
      </Pressable>

      {!item.done && (
        <Pressable
          onPressIn={drag}
          disabled={isTemp}
          hitSlop={8}
          accessibilityLabel={`Reorder ${item.text}`}
          className={cn('h-9 w-6 items-center justify-center', isTemp && 'opacity-30')}
        >
          <Icon as={GripVerticalIcon} className='text-muted-foreground size-5' />
        </Pressable>
      )}
    </View>
  )
}

export default function NotesList() {
  const insets = useSafeAreaInsets()
  const inputRef = useRef<TextInputInstance>(null)
  const [inputValue, setInputValue] = useState('')

  const user = useAuthUser()
  const { groupId } = useGroupIdParam()

  const { data: items = [] } = useGetTasks(groupId)
  const addTask = useAddTaskMutation()
  const deleteTask = useDeleteTaskMutation()
  const { mutate: reorderTasks } = useReorderTasksMutation()

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => Number(a.done) - Number(b.done)),
    [items]
  )

  // keep the order override from before: it holds the user's order while requests are in flight
  const [orderOverride, setOrderOverride] = useState<string[] | null>(null)
  const inFlight = useRef(0)

  const displayItems = useMemo(() => {
    if (!orderOverride) return sortedItems
    const rank = (id: string) => orderOverride.indexOf(id)
    return [...sortedItems].sort((a, b) => rank(a.id) - rank(b.id))
  }, [sortedItems, orderOverride])

  const handleReorder = useCallback(
    ({ from, to }: ReorderableListReorderEvent) => {
      if (from === to) return
      const next = reorderItems(displayItems, from, to)

      inFlight.current += 1
      setOrderOverride(next.map(t => t.id))

      reorderTasks(
        { groupId, orderedIds: next.map(t => t.id).filter(id => !isTempId(id)) },
        {
          onSettled: () => {
            inFlight.current -= 1
            if (inFlight.current === 0) setOrderOverride(null)
          },
        }
      )
    },
    [displayItems, groupId, reorderTasks]
  )

  const handleAdd = () => {
    const text = inputValue.trim()
    if (!text) return
    addTask.mutate({ groupId, text })
    setInputValue('')
    inputRef.current?.focus()
  }

  const doneItems = items.filter(task => task.done && !isTempId(task.id))
  const openCount = items.length - items.filter(task => task.done).length

  const clearDone = () => {
    for (const task of doneItems) deleteTask.mutate({ taskId: task.id, groupId })
  }

  const renderItem = useCallback(
    ({ item }: { item: Task }) => <TaskRow item={item} groupId={groupId} userId={user.id} />,
    [groupId, user.id]
  )

  return (
    <ReorderableList
      data={displayItems}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      onReorder={handleReorder}
      keyboardShouldPersistTaps='handled'
      style={{ marginBottom: insets.bottom + 8 }}
      ListHeaderComponent={
        <View className='gap-4 pb-1'>
          <View className='flex-row gap-2'>
            <Input
              ref={inputRef}
              placeholder='Add an item…'
              accessibilityLabel='New shopping or to-do item'
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={handleAdd}
              returnKeyType='done'
              submitBehavior='submit'
              className='flex-1'
            />
            <Button
              size='icon'
              className='size-control'
              accessibilityLabel='Add item'
              disabled={!inputValue.trim()}
              onPress={handleAdd}
            >
              <Icon as={PlusIcon} />
            </Button>
          </View>
          {items.length > 0 && (
            <View className='flex-row items-center justify-between'>
              <SectionLabel>
                {openCount} to do · {items.length - openCount} done
              </SectionLabel>
              {doneItems.length > 0 && (
                <Button variant='ghost' size='sm' onPress={clearDone}>
                  <Text className='text-muted-foreground'>Clear done</Text>
                </Button>
              )}
            </View>
          )}
        </View>
      }
      ListEmptyComponent={
        <Empty
          title='No notes yet'
          icon={NotebookIcon}
          description='Keep a shared shopping or to-do list for the group here.'
        />
      }
    />
  )
}
