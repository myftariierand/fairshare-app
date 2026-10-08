// hooks/use-forgot-password.ts
import { useMutation } from '@tanstack/react-query';
import { forgotPassword } from '@/lib/auth';

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
  });
};
