import { create } from "zustand";

interface WizardState {
  currentStep: number;
  values: Record<string, any>;
  setStep: (step: number) => void;
  setValues: (values: Record<string, any>) => void;
}

export const useWizardStore = create<WizardState>((set) => ({
  currentStep: 0,
  values: {},
  setStep: (step) => set({ currentStep: step }),
  setValues: (values) =>
    set((state) => ({ values: { ...state.values, ...values } })),
}));
