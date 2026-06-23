import { create } from 'zustand';

export type AppView = 'landing' | 'order' | 'success' | 'admin';
export type OrderStep = 1 | 2 | 3 | 4;

export interface StudentData {
  name: string;
  className: string;
  parentName: string;
  whatsapp: string;
  notes: string;
}

export interface OrderData {
  productType: 'Stelan Baju + Celana' | 'Baju saja' | 'Celana saja';
  sizeAsbd: number;
  qty: number;
}

export interface PaymentData {
  senderName: string;
  senderBank: string;
  transferDate: string;
  transferAmount: number;
  proofFile: File | null;
}

export interface OrderResult {
  orderNumber: string;
  studentName: string;
  product: string;
  size: number;
  qty: number;
  totalPrice: number;
}

interface AppState {
  // Navigation
  currentView: AppView;
  currentStep: OrderStep;
  setView: (view: AppView) => void;
  setStep: (step: OrderStep) => void;
  resetOrder: () => void;

  // Form data
  student: StudentData;
  order: OrderData;
  payment: PaymentData;
  setStudent: (data: Partial<StudentData>) => void;
  setOrder: (data: Partial<OrderData>) => void;
  setPayment: (data: Partial<PaymentData>) => void;

  // Result
  lastOrder: OrderResult | null;
  setLastOrder: (order: OrderResult) => void;

  // Admin
  adminAuthenticated: boolean;
  setAdminAuthenticated: (v: boolean) => void;

  // UI
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
}

const initialStudent: StudentData = {
  name: '',
  className: '',
  parentName: '',
  whatsapp: '',
  notes: '',
};

const initialOrder: OrderData = {
  productType: 'Stelan Baju + Celana',
  sizeAsbd: 0,
  qty: 1,
};

const initialPayment: PaymentData = {
  senderName: '',
  senderBank: '',
  transferDate: '',
  transferAmount: 0,
  proofFile: null,
};

export const useAppStore = create<AppState>((set) => ({
  currentView: 'landing',
  currentStep: 1,
  setView: (view) => set({ currentView: view }),
  setStep: (step) => set({ currentStep: step }),
  resetOrder: () =>
    set({
      currentView: 'landing',
      currentStep: 1,
      student: initialStudent,
      order: initialOrder,
      payment: initialPayment,
      lastOrder: null,
    }),

  student: initialStudent,
  order: initialOrder,
  payment: initialPayment,
  setStudent: (data) => set((s) => ({ student: { ...s.student, ...data } })),
  setOrder: (data) => set((s) => ({ order: { ...s.order, ...data } })),
  setPayment: (data) => set((s) => ({ payment: { ...s.payment, ...data } })),

  lastOrder: null,
  setLastOrder: (order) => set({ lastOrder: order }),

  adminAuthenticated: false,
  setAdminAuthenticated: (v) => set({ adminAuthenticated: v }),

  isSubmitting: false,
  setIsSubmitting: (v) => set({ isSubmitting: v }),
}));
