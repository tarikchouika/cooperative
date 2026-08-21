'use client';
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Association, Cashbox, Transaction, Member } from '@prisma/client';

export default function Initialize({ children }: { children: React.ReactNode }) {
  const setAssociation = useStore((s) => s.setAssociation);
  const setCashbox = useStore((s) => s.setCashbox);
  const setTransactions = useStore((s) => s.setTransactions);
  const setMembers = useStore((s) => s.setMembers);

  useEffect(() => {
    (async () => {
      const [assocRes, boxRes, txsRes, membersRes] = await Promise.all([
        fetch('/api/association'),
        fetch('/api/cashbox'),
        fetch('/api/transactions'),
        fetch('/api/members'),
      ]);
      const assoc = await assocRes.json();
      const box = await boxRes.json();
      const txs = await txsRes.json();
      const members = await membersRes.json();
      setAssociation(assoc as Association);
      setCashbox(box as Cashbox);
      setTransactions(txs as Transaction[]);
      setMembers(members as Member[]);
    })();
  }, []);

  return <>{children}</>;
}
