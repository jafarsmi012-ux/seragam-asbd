'use client';

import { useAppStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { User, Phone, BookOpen, MessageSquare } from 'lucide-react';

const classOptions = [
  'Kelas 1',
  'Kelas 2',
  'Kelas 3',
  'Kelas 4',
  'Kelas 5',
  'Kelas 6',
];

export function StudentForm() {
  const student = useAppStore((s) => s.student);
  const setStudent = useAppStore((s) => s.setStudent);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
          <User className="h-4 w-4 text-navy-600" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-navy-800">
            Data Siswa
          </h3>
          <p className="text-xs text-muted-foreground">
            Lengkapi data siswa dan orang tua/wali
          </p>
        </div>
      </div>

      <Card className="card-shadow rounded-xl border-navy-100">
        <CardContent className="p-4 space-y-4">
          {/* Nama Siswa */}
          <div className="space-y-1.5">
            <Label htmlFor="studentName" className="text-sm font-medium text-navy-700">
              Nama Siswa <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="studentName"
                placeholder="Masukkan nama lengkap siswa"
                value={student.name}
                onChange={(e) => setStudent({ name: e.target.value })}
                className="pl-10 border-navy-200 focus:border-navy-500"
              />
            </div>
          </div>

          {/* Kelas */}
          <div className="space-y-1.5">
            <Label htmlFor="className" className="text-sm font-medium text-navy-700">
              Kelas <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                id="className"
                value={student.className}
                onChange={(e) => setStudent({ className: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-navy-200 text-sm bg-white focus:outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-500 appearance-none cursor-pointer"
              >
                <option value="">Pilih kelas</option>
                {classOptions.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Nama Orang Tua/Wali */}
          <div className="space-y-1.5">
            <Label htmlFor="parentName" className="text-sm font-medium text-navy-700">
              Nama Orang Tua/Wali <span className="text-destructive">*</span>
            </Label>
            <Input
              id="parentName"
              placeholder="Masukkan nama orang tua/wali"
              value={student.parentName}
              onChange={(e) => setStudent({ parentName: e.target.value })}
              className="border-navy-200 focus:border-navy-500"
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp" className="text-sm font-medium text-navy-700">
              Nomor WhatsApp Aktif <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="whatsapp"
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={student.whatsapp}
                onChange={(e) => setStudent({ whatsapp: e.target.value })}
                className="pl-10 border-navy-200 focus:border-navy-500"
              />
            </div>
          </div>

          {/* Catatan */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-sm font-medium text-navy-700">
              Catatan Tambahan{' '}
              <span className="text-muted-foreground font-normal">(opsional)</span>
            </Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="notes"
                placeholder="Catatan khusus (ukuran, permintaan khusus, dll)"
                value={student.notes}
                onChange={(e) => setStudent({ notes: e.target.value })}
                className="pl-10 min-h-[80px] border-navy-200 focus:border-navy-500 resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
