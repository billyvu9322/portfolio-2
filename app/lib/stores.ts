"use client";

import { create } from "zustand";

export type SectionId = "home" | "work" | "about" | "skills" | "contact";

type SectionState = {
  section: SectionId;
  setSection: (s: SectionId) => void;
};

export const useSection = create<SectionState>((set) => ({
  section: "home",
  setSection: (section) => set({ section }),
}));

type MusicState = {
  isMusicInitialized: boolean;
  isSoundEnabled: boolean;
  toggleSound: () => void;
};

export const useMusic = create<MusicState>((set) => ({
  isMusicInitialized: false,
  isSoundEnabled: false,
  toggleSound: () =>
    set((s) =>
      s.isMusicInitialized
        ? { isSoundEnabled: !s.isSoundEnabled }
        : { isMusicInitialized: true, isSoundEnabled: true }
    ),
}));
