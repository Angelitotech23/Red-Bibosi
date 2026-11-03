import { getSupabaseBrowserClient } from "@/lib/client/supabase-browser";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type CaseRealtimeHandlers = {
  onCommentChange?: () => void;
  onVoteChange?: () => void;
};

/**
 * Suscripción Realtime a comentarios y votos del caso abierto.
 * Canal tentativo (C-07 pendiente). Devuelve cleanup / desuscripción.
 */
export function subscribeToCaseRealtime(
  postId: string,
  handlers: CaseRealtimeHandlers,
): () => void {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return () => undefined;
  }

  const channel: RealtimeChannel = client
    .channel(`case:${postId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "comments",
        filter: `post_id=eq.${postId}`,
      },
      () => {
        handlers.onCommentChange?.();
      },
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "votes",
        filter: `post_id=eq.${postId}`,
      },
      () => {
        handlers.onVoteChange?.();
      },
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}
