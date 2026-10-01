import type { Href } from 'expo-router';

export type AppHref = Href;

/** Session states used by the root layout to pick (auth), (onboarding) or (app). */
export type SessionStatus = 'loading' | 'signedOut' | 'onboarding' | 'signedIn';
