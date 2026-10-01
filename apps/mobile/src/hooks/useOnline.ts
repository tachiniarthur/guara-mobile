import { useNetworkState } from 'expo-network';

/** `true` while connected. Unknown state counts as online to avoid false alarms. */
export function useOnline(): boolean {
  const { isConnected, isInternetReachable } = useNetworkState();
  return isConnected !== false && isInternetReachable !== false;
}
