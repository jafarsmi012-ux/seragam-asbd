'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  { icon: User, label: 'Data Siswa' },
  { icon: ShoppingBag, label: 'Pilih Pesanan' },
  { icon: CreditCard, label: 'Pembayaran' },
  { icon: CheckCircle2, label: 'Konfirmasi' },
];

interface HeroSectionProps {
  onStartOrder?: () => void;
}

export function HeroSection({ onStartOrder }: HeroSectionProps) {

  return (
    <section className="relative overflow-hidden hero-gradient">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-navy-400/10" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-navy-400/5" />
        <div className="absolute -bottom-16 right-1/4 w-48 h-48 rounded-full bg-gold-400/10" />
        {/* Geometric pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 20px),
              repeating-linear-gradient(-45deg, white 0px, white 1px, transparent 1px, transparent 20px)`,
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
        {/* School badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="bg-gold-400/20 text-gold-200 border-gold-400/30 px-4 py-1.5 text-sm font-medium backdrop-blur-sm mb-6">
            <span className="mr-1.5">🏫</span>
            SD Islam Al Azhar 62 Summarecon Bandung
          </Badge>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="font-heading text-3xl md:text-5xl font-bold text-white leading-tight mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Form Pemesanan Seragam ASBD
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-navy-200 text-lg md:text-xl mb-4 font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Tahun Ajaran 2026/2027
        </motion.p>

        {/* Description */}
        <motion.p
          className="text-navy-100/80 max-w-lg mx-auto mb-8 text-sm md:text-base"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Pilih ukuran seragam, isi data siswa, lakukan pembayaran, lalu upload bukti transfer.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            onClick={onStartOrder}
            size="lg"
            className="bg-gold-400 hover:bg-gold-500 text-navy-900 font-semibold text-base md:text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            Mulai Pemesanan
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>

        {/* Step indicators */}
        <motion.div
          className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {steps.map((step, idx) => (
            <div
              key={step.label}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-gold-400/20 flex items-center justify-center text-gold-300 text-xs font-bold">
                  {idx + 1}
                </div>
                <step.icon className="h-4 w-4 text-navy-200" />
              </div>
              <span className="text-xs text-navy-100 font-medium">
                {step.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
