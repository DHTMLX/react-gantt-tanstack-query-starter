import { create } from 'zustand';
import type { Link, GanttConfig, SerializedTask } from '@dhtmlx/trial-react-gantt';
import { defaultZoomLevels, type ZoomLevel } from './seed/Seed';

export type Snapshot = {
  tasks: SerializedTask[];
  links: Link[];
  config: GanttConfig;
};

type State = {
  config: GanttConfig;

  past: Snapshot[];
  future: Snapshot[];
  maxHistory: number;

  recordHistory: (snapshot: Snapshot) => void;
  undo: (snapshot: Snapshot) => Snapshot | null;
  redo: (snapshot: Snapshot) => Snapshot | null;

  setZoom: (level: ZoomLevel) => void;
};

export const useGanttStore = create<State>((set, get) => ({
  config: { zoom: defaultZoomLevels },

  past: [],
  future: [],
  maxHistory: 50,

  recordHistory: (snapshot) => {
    const { past, maxHistory } = get();

    set({
      past: [...past.slice(-maxHistory + 1), snapshot],
      future: [],
    });
  },

  undo: (snapshot: Snapshot) => {
    const { past, future } = get();
    if (!past.length) return null;

    const previous = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [{ ...snapshot }, ...future],
      config: previous.config,
    });

    return previous;
  },

  redo: (snapshot: Snapshot) => {
    const { past, future } = get();
    if (!future.length) return null;

    const next = future[0];
    set({
      past: [...past, { ...snapshot }],
      future: future.slice(1),
      config: next.config,
    });

    return next;
  },

  setZoom: (level) => {
    set({
      config: {
        ...get().config,
        zoom: { ...get().config.zoom, current: level },
      },
    });
  },
}));
