// src/store/useStore.ts
import { create } from 'zustand';
import { Member, Transaction, Association, Cashbox } from '@prisma/client';

type State = {
  members: Member[];
  setMembers: (members: Member[]) => void;
  transactions: Transaction[];
  setTransactions: (txs: Transaction[]) => void;
  association: Association | null;
  setAssociation: (a: Association) => void;
  cashbox: Cashbox | null;
  setCashbox: (c: Cashbox) => void;
};

export const useStore = create<State>((set) => ({
  members: [],
  setMembers: (members) => set({ members }),

  transactions: [],
  setTransactions: (txs) => set({ transactions: txs }),

  association: null,
  setAssociation: (a) => set({ association: a }),

  cashbox: null,
  setCashbox: (c) => set({ cashbox: c }),
}));
