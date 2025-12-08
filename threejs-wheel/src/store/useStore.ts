import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Participant {
  id: string;
  name: string;
  color: string;
}

interface WheelState {
  names: Participant[];
  winner: Participant | null;
  isSpinning: boolean;
  addName: (name: string) => void;
  addNames: (names: string[]) => void;
  removeName: (id: string) => void;
  startSpin: () => void;
  stopSpin: () => void;
  setWinner: (winner: Participant) => void;
}

const COLORS = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#FFC0CB', // Pink
  '#A52A2A', // Brown
];

export const useStore = create<WheelState>((set) => ({
  names: [
    { id: uuidv4(), name: 'Santa', color: COLORS[0] },
    { id: uuidv4(), name: 'Elf', color: COLORS[1] },
    { id: uuidv4(), name: 'Reindeer', color: COLORS[2] },
  ],
  winner: null,
  isSpinning: false,
  addName: (name: string) =>
    set((state) => {
      if (state.names.length >= 60) return state;
      const color = COLORS[state.names.length % COLORS.length];
      return {
        names: [...state.names, { id: uuidv4(), name, color }],
      };
    }),
  addNames: (newNames: string[]) =>
    set((state) => {
      const availableSlots = 60 - state.names.length;
      if (availableSlots <= 0) return state;
      
      const namesToAdd = newNames.slice(0, availableSlots);
      const newParticipants = namesToAdd.map((name, index) => ({
        id: uuidv4(),
        name,
        color: COLORS[(state.names.length + index) % COLORS.length]
      }));
      
      return {
        names: [...state.names, ...newParticipants]
      };
    }),
  removeName: (id: string) =>
    set((state) => ({
      names: state.names.filter((n) => n.id !== id),
    })),
  startSpin: () => set({ isSpinning: true, winner: null }),
  stopSpin: () => set({ isSpinning: false }),
  setWinner: (winner: Participant) => set({ winner }),
}));
