'use client';

export const dynamic = 'force-dynamic';

import { useStore } from '@/store/useStore';
import { useState } from 'react';

import { Association } from '@prisma/client';
import { useForm } from 'react-hook-form';

type FormValues = {
  name: string;
  address?: string;
  phone?: string;
  currency: string;
};

export default function SettingsPage() {
  const association = useStore((s) => s.association);
  const setAssociation = useStore((s) => s.setAssociation);
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: association
      ? { name: association.name, address: association.address ?? undefined, phone: association.phone ?? undefined, currency: association.currency }
      : undefined,
  });

  const onSubmit = async (data: FormValues) => {
    const res = await fetch('/api/association', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const fresh = await res.json();
    setAssociation(fresh as Association);
    alert('تم حفظ الإعدادات');
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">إعدادات الجمعية</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">اسم الجمعية</label>
          <input
            {...register('name', { required: true })}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1">العنوان</label>
          <input {...register('address')} className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block mb-1">الهاتف</label>
          <input {...register('phone')} className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block mb-1">العملة</label>
          <input
            {...register('currency', { required: true })}
            className="w-full border rounded p-2"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-primary text-white rounded"
        >
          حفظ الإعدادات
        </button>
      </form>
    </div>
  );
}
