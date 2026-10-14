import { toast } from 'sonner-native';

import { useGroupIdParam } from '@/hooks/use-group-id-param';

import { getErrorMessage } from '@/lib/utils';

import type { Member } from '@/types/group';

import { UserMinusIcon } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/spinner';
import { useRemoveMember } from '@/hooks/use-group-api';

type Props = {
  member: Member;
};

export function RemoveMemberDialog(props: Props) {
  const { groupId } = useGroupIdParam();
  const removeMember = useRemoveMember();

  const handleRemoveMember = async () => {
    try {
      await removeMember.mutateAsync({
        groupId,
        memberId: props.member.id,
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size={'icon'} variant={'outline'} disabled={removeMember.isPending}>
          <Icon as={UserMinusIcon} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove member?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove {props.member.name} from the group? This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Text>Cancel</Text>
          </AlertDialogCancel>
          <AlertDialogAction asChild disabled={removeMember.isPending} onPress={handleRemoveMember}>
            <Button variant={'destructive'}>{false ? <Spinner /> : <Text>Remove</Text>}</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
