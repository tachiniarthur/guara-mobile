import { getNetworkStateAsync } from 'expo-network';

/**
 * One-off connection check before sending something (the screens use `useOnline`). An unknown
 * state counts as online, like `useOnline`.
 */
export async function isOnline(): Promise<boolean> {
  try {
    const { isConnected, isInternetReachable } = await getNetworkStateAsync();
    return isConnected !== false && isInternetReachable !== false;
  } catch {
    return true;
  }
}
