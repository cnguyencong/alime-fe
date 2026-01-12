import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect } from "react";

interface StreamBuffer {
  content: string;
  timestamp: number;
  isComplete: boolean;
}

interface StreamBufferStore {
  buffers: Record<string, StreamBuffer>;
  bufferStreamContent: (
    messageId: string,
    content: string,
    isComplete?: boolean
  ) => void;
  getBufferedContent: (messageId: string) => string | null;
  clearBuffer: (messageId: string) => void;
  getBufferedMessageIds: () => string[];
  clearAllBuffers: () => void;
  hasBuffer: (messageId: string) => boolean;
  cleanupOldBuffers: () => void;
}

/**
 * Zustand store for managing stream buffers with persistence
 * Uses Zustand's persist middleware to automatically save to localStorage
 */
export const useStreamBufferStore = create<StreamBufferStore>()(
  persist(
    (set, get) => ({
      buffers: {},

      bufferStreamContent: (
        messageId: string,
        content: string,
        isComplete = false
      ) => {
        set((state) => ({
          buffers: {
            ...state.buffers,
            [messageId]: {
              content,
              timestamp: Date.now(),
              isComplete,
            },
          },
        }));
      },

      getBufferedContent: (messageId: string) => {
        const buffer = get().buffers[messageId];
        return buffer ? buffer.content : null;
      },

      clearBuffer: (messageId: string) => {
        set((state) => {
          const { [messageId]: _, ...rest } = state.buffers;
          return { buffers: rest };
        });
      },

      getBufferedMessageIds: () => {
        return Object.keys(get().buffers);
      },

      clearAllBuffers: () => {
        set({ buffers: {} });
      },

      hasBuffer: (messageId: string) => {
        return messageId in get().buffers;
      },

      cleanupOldBuffers: () => {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        set((state) => {
          const filtered: Record<string, StreamBuffer> = {};
          Object.entries(state.buffers).forEach(([id, buffer]) => {
            // Keep buffers that are recent and not complete
            if (buffer.timestamp > oneDayAgo && !buffer.isComplete) {
              filtered[id] = buffer;
            }
          });
          return { buffers: filtered };
        });
      },
    }),
    {
      name: "stream-buffers-storage", // localStorage key
      // Only persist the buffers, not the functions
      partialize: (state) => ({ buffers: state.buffers }),
    }
  )
);

/**
 * Hook wrapper for easier usage (maintains same API as before)
 */
export function useStreamBuffer() {
  const bufferStreamContent = useStreamBufferStore(
    (state) => state.bufferStreamContent
  );
  const getBufferedContent = useStreamBufferStore(
    (state) => state.getBufferedContent
  );
  const clearBuffer = useStreamBufferStore((state) => state.clearBuffer);
  const getBufferedMessageIds = useStreamBufferStore(
    (state) => state.getBufferedMessageIds
  );
  const clearAllBuffers = useStreamBufferStore(
    (state) => state.clearAllBuffers
  );
  const hasBuffer = useStreamBufferStore((state) => state.hasBuffer);
  const cleanupOldBuffers = useStreamBufferStore(
    (state) => state.cleanupOldBuffers
  );

  // Cleanup old buffers on mount (only once)
  useEffect(() => {
    cleanupOldBuffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    bufferStreamContent,
    getBufferedContent,
    clearBuffer,
    getBufferedMessageIds,
    clearAllBuffers,
    hasBuffer,
  };
}
