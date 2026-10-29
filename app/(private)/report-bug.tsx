import { useMemo } from 'react'
import { View } from 'react-native'
import { Stack, router } from 'expo-router'
import { useStore } from '@tanstack/react-form'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useCSSVariable } from 'uniwind'
import { toast } from 'sonner-native'
import { z } from 'zod'

import { useAppForm } from '@/lib/form'
import { useAuthUser } from '@/lib/auth-context'
import { getDeviceSummary } from '@/lib/device-info'
import { getErrorMessage } from '@/lib/utils'
import { useFullSheetTopInset } from '@/hooks/use-full-sheet-top-inset'
import { BUG_SEVERITIES, useReportBugMutation, type BugSeverity } from '@/services/bug-report'

import { XIcon } from 'lucide-react-native'

import { Text } from '@/components/ui/text'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Spinner } from '@/components/spinner'

const SEVERITY: Record<BugSeverity, { label: string; hint: string }> = {
  CRITICAL: {
    label: 'Critical',
    hint: 'The app crashes, loses data or stops you doing something important.',
  },
  MAJOR: { label: 'Major', hint: "A feature is broken, but there's a way around it." },
  MINOR: { label: 'Minor', hint: "Something small doesn't work the way it should." },
  COSMETIC: { label: 'Cosmetic', hint: 'Looks wrong: layout, text, colors or icons.' },
}

export default function ReportBugScreen() {
  const user = useAuthUser()
  const card = useCSSVariable('--color-card') as string
  const topInset = useFullSheetTopInset()
  const reportBug = useReportBugMutation()
  const device = useMemo(getDeviceSummary, [])

  const form = useAppForm({
    defaultValues: {
      title: '',
      description: '',
      severity: 'MINOR' as BugSeverity,
      includeContact: true,
    },
    validators: {
      onSubmit: z.object({
        title: z.string().trim().min(3, 'Add a short title'),
        description: z.string().trim().min(10, 'Tell us a bit more about what happened'),
        severity: z.enum(BUG_SEVERITIES),
        includeContact: z.boolean(),
      }),
    },
    onSubmit: async ({ value }) => {
      try {
        await reportBug.mutateAsync({
          title: value.title.trim(),
          description: value.description.trim(),
          severity: value.severity,
          device,
          ...(value.includeContact ? { name: user.name, email: user.email } : {}),
        })
        toast.success('Thanks, we got your report')
        router.back()
      } catch (error) {
        toast.error(getErrorMessage(error))
      }
    },
  })

  const severity = useStore(form.store, s => s.values.severity)
  const includeContact = useStore(form.store, s => s.values.includeContact)

  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          // Full height: iOS stretches a shorter custom detent when the keyboard opens
          sheetAllowedDetents: [1],
          contentStyle: { backgroundColor: card },
        }}
      />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps='handled'
        bottomOffset={24}
        style={{ backgroundColor: card }}
        contentContainerStyle={{
          padding: 20,
          paddingTop: topInset + 24,
          paddingBottom: 40,
          gap: 20,
        }}
      >
        <View className='flex-row items-start gap-3'>
          <View className='flex-1'>
            <Text role='heading' className='text-2xl font-bold tracking-tight'>
              Report a bug
            </Text>
            <Text className='text-muted-foreground mt-1'>
              Tell us what went wrong and we'll look into it.
            </Text>
          </View>
          <Button
            size='icon'
            variant='outline'
            accessibilityLabel='Close'
            onPress={() => router.back()}
          >
            <Icon as={XIcon} className='size-5' />
          </Button>
        </View>

        <form.AppField
          name='title'
          children={field => (
            <View className='gap-2'>
              <Label nativeID='bug-title'>Title</Label>
              <field.Input
                aria-labelledby='bug-title'
                placeholder="e.g. Balance doesn't update after settling"
                returnKeyType='next'
                className='bg-secondary'
                value={field.state.value}
                onChangeText={field.handleChange}
              />
              {field.state.meta.errors.length > 0 && (
                <Text className='text-destructive text-sm'>
                  {field.state.meta.errors[0]?.message}
                </Text>
              )}
            </View>
          )}
        />

        <form.AppField
          name='description'
          children={field => (
            <View className='gap-2'>
              <Label nativeID='bug-description'>What happened</Label>
              <field.Input
                aria-labelledby='bug-description'
                placeholder='What did you do, what did you expect, and what happened instead?'
                multiline
                textAlignVertical='top'
                className='bg-secondary h-36 py-3'
                value={field.state.value}
                onChangeText={field.handleChange}
              />
              {field.state.meta.errors.length > 0 ? (
                <Text className='text-destructive text-sm'>
                  {field.state.meta.errors[0]?.message}
                </Text>
              ) : (
                <Text className='text-muted-foreground text-sm'>
                  Steps to reproduce help us fix it faster.
                </Text>
              )}
            </View>
          )}
        />

        <View className='gap-2'>
          <Label>Severity</Label>
          <Tabs
            value={severity}
            onValueChange={value => form.setFieldValue('severity', value as BugSeverity)}
          >
            <TabsList className='w-full'>
              {BUG_SEVERITIES.map(value => (
                <TabsTrigger key={value} value={value}>
                  <Text>{SEVERITY[value].label}</Text>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Text className='text-muted-foreground text-sm'>{SEVERITY[severity].hint}</Text>
        </View>

        <View className='gap-3'>
          <View className='flex-row items-center gap-3'>
            <View className='flex-1'>
              <Text className='font-medium'>Include my contact details</Text>
              <Text className='text-muted-foreground text-sm' numberOfLines={1}>
                {includeContact ? `${user.name} · ${user.email}` : 'Send the report anonymously'}
              </Text>
            </View>
            <Switch
              checked={includeContact}
              onCheckedChange={checked => form.setFieldValue('includeContact', checked)}
              accessibilityLabel='Include my contact details'
            />
          </View>
          <Text className='text-muted-foreground text-sm'>Sent with your report: {device}</Text>
        </View>

        <form.Subscribe
          selector={state => state.isSubmitting}
          children={isSubmitting => (
            <Button className='mt-2' disabled={isSubmitting} onPress={() => form.handleSubmit()}>
              {isSubmitting ? <Spinner /> : <Text>Send report</Text>}
            </Button>
          )}
        />
      </KeyboardAwareScrollView>
    </>
  )
}
