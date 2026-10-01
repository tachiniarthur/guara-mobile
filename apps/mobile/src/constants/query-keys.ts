/** Global query keys. Feature-specific keys live in `src/features/<feature>/api`. */
export const queryKeys = {
  me: ['me'] as const,
  unreadNotifications: ['notifications', 'unread-count'] as const,
};
