import { Platform } from 'react-native'
import * as Device from 'expo-device'
import Constants from 'expo-constants'

// One-line description of this device and build for support requests,
// e.g. "Pixel 10 Pro · Android 16 · FairShare 1.0.0 (SDK 58)"
export function getDeviceSummary() {
  const model = Device.modelName ?? Device.deviceName ?? 'Unknown device'
  const os = `${Device.osName ?? Platform.OS} ${Device.osVersion ?? Platform.Version}`
  const version = Constants.expoConfig?.version
  const sdk = Constants.expoConfig?.sdkVersion?.split('.')[0]
  const app = ['FairShare', version, sdk && `(SDK ${sdk})`].filter(Boolean).join(' ')
  return [model, os, app].join(' · ')
}
