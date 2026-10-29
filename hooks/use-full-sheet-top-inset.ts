import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Extra top padding for a sheet at full height (sheetAllowedDetents: [1]).
// On Android that sheet reaches behind the status bar, so content needs the inset;
// iOS keeps sheets below the status bar on its own.
export function useFullSheetTopInset() {
  const insets = useSafeAreaInsets()
  return Platform.OS === 'android' ? insets.top : 0
}
