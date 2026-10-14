// lib/form.ts
import { createFormHook, createFormHookContexts, formOptions } from '@tanstack/react-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: { Input },
  formComponents: { Button },
  fieldContext,
  formContext,
});

export const expenseFormOpts = formOptions({
  defaultValues: {
    category: 'OTHER',
    description: '',
    amount: '',
    paidBy: '',
    splits: [] as { name: string; userId: string; amount: string }[],
  },
});
