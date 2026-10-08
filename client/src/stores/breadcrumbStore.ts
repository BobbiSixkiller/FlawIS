"use client";

import { create } from "zustand";

export type ResourceLabel = {
  param: string;
  value: string;
  path: string;
  label: string;
  lng: string;
};

interface BreadcrumbState {
  registrations: Record<string, ResourceLabel>;
  registerLabel: (id: string, label: ResourceLabel) => () => void;
}

// Labels are published from client effects only; server rendering uses the empty
// initial state. Never populate this module-level store from a server component.
export const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
  registrations: {},
  registerLabel: (id, label) => {
    set((state) => ({
      registrations: { ...state.registrations, [id]: label },
    }));
    return () => {
      set((state) => {
        if (state.registrations[id] !== label) return state;
        const registrations = { ...state.registrations };
        delete registrations[id];
        return { registrations };
      });
    };
  },
}));
