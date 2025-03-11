import { create } from "zustand";
import { devtools } from "zustand/middleware"; // Import devtools middleware

type Transition = {
  transitionForSegmentId: string;
  time?: number;
};

type State = {
  segmentTransitions: Transition[];
  isPlaying: boolean;
};

type Action = {
  updateSegmentTransitions: (transition: Transition) => void;
  togglePlaying: () => void;
  setSegmentTransition: (transition: Transition) => void;
};

export const useTransitions = create<State & Action>()(
  devtools((set) => ({
    segmentTransitions: [],
    isPlaying: false,

    updateSegmentTransitions: (transition: Transition) =>
      set((state) => {
        return state.segmentTransitions
          .map((s) => s.transitionForSegmentId)
          .includes(transition.transitionForSegmentId)
          ? {
              segmentTransitions: state.segmentTransitions.filter(
                (a) =>
                  a.transitionForSegmentId !== transition.transitionForSegmentId
              ),
            }
          : {
              segmentTransitions: [...state.segmentTransitions, transition],
            };
      }),

    setSegmentTransition: (transition: Transition) =>
      set((state) => {
        return state.segmentTransitions.some(
          (s) => s.transitionForSegmentId === transition.transitionForSegmentId
        )
          ? { segmentTransitions: [] }
          : {
              segmentTransitions: [transition],
            };
      }),

    togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),
  }))
);
