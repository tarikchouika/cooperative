"use client";
// src/components/MemberForm.tsx
import { useForm } from 'react-hook-form';
import { Member } from '@prisma/client';
import { useStore } from '@/store/useStore';

type Props = {
  defaultValues?: Partial<Member>;
  onClose: () => void;
};

type FormValues = {
  fullName: string;
  email: string;
  phone?: string;
};

export default function MemberForm({ defaultValues, onClose }: Props) {
  const { register, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: defaultValues
      ? { fullName: defaultValues.fullName ?? undefined, email: defaultValues.email ?? undefined, phone: defaultValues.phone ?? undefined }
      : undefined,
  });
  const setMembers = useStore((s) => s.setMembers);

  const onSubmit = async (data: FormValues) => {
    const memberData = {
      ...data,
      phone: data.phone ?? null,
    };
    // إذا كان هناك ID يعني تعديل
    if ((defaultValues as any)?.id) {
      await fetch(`/api/members/${(defaultValues as any).id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });
    } else {
      await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });
    }
    // تحديث الstore
    const res = await fetch('/api/members');
    const members = await res.json();
    setMembers(members);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      <div>
        <label className="block mb-1">الاسم الكامل</label>
        <input
          {...register('fullName', { required: true })}
          className="w-full border rounded p-2"
        />
        {formState.errors.fullName && (
          <p className="text-red-600 text-xs mt-1">مطلوب</p>
        )}
      </div>

      <div>
        <label className="block mb-1">البريد الإلكتروني</label>
        <input
          type="email"
          {...register('email', { required: true })}
          className="w-full border rounded p-2"
        />
        {formState.errors.email && (
          <p className="text-red-600 text-xs mt-1">مطلوب</p>
        )}
      </div>

      <div>
        <label className="block mb-1">الهاتف</label>
        <input
          {...register('phone')}
          className="w-full border rounded p-2"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          إلغاء
        </button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
          حفظ
        </button>
      </div>
    </form>
  );
}
