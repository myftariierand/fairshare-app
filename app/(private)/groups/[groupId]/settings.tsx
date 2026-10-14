import { Stack } from 'expo-router';

import { useGetGroupById } from '@/hooks/use-group-api';
import { useGroupIdParam } from '@/hooks/use-group-id-param';

import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RemoveMemberDialog } from '@/components/group/remove-member-dialog';
import { EditGroupForm } from '@/components/group/edit-group-form';
import { Separator } from '@/components/ui/separator';
import DeleteGroup from '@/components/group/delete-group';

const SettingsScreen = () => {
  const { groupId } = useGroupIdParam();
  const { data } = useGetGroupById(groupId);

  if (!data) return null;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
        }}
      />
      <View className="p-4">
        <EditGroupForm data={data} />
        <Text className="mt-6 mb-4" variant={'large'}>
          Members
        </Text>
        <View className="gap-4">
          {data?.members.map((member) => (
            <View key={member.id} className="flex-row items-center gap-2">
              <Avatar alt={member.name}>
                <AvatarFallback className="border-border border">
                  <Text variant={'muted'} className="text-xs">
                    {member.name.slice(0, 2)}
                  </Text>
                </AvatarFallback>
              </Avatar>
              <View className="flex-1">
                <Text>{member.name}</Text>
                <Text variant={'muted'}>{member.email}</Text>
              </View>
              <RemoveMemberDialog member={member} />
            </View>
          ))}
        </View>
        <Separator className="my-4" />
        <DeleteGroup />
      </View>
    </>
  );
};

export default SettingsScreen;
