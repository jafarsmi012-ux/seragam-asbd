'use client';

import { useState } from 'react';
import { useAppStore, type OrderStep } from '@/lib/store';
import { HeroSection } from '@/components/landing/HeroSection';
import { SizeChart } from '@/components/landing/SizeChart';
import { PaymentCard } from '@/components/landing/PaymentCard';
import { Footer } from '@/components/landing/Footer';
import { StepIndicator } from '@/components/order/StepIndicator';
import { StudentForm } from '@/components/order/StudentForm';
import { ProductForm } from '@/components/order/ProductForm';
import { PaymentStep } from '@/components/order/PaymentStep';
import { ConfirmationForm } from '@/components/order/ConfirmationForm';
import { OrderSummary } from '@/components/order/OrderSummary';
import { SuccessView } from '@/components/order/SuccessView';
import { AdminView } from '@/components/admin/AdminView';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Send, Loader2, ShoppingBag } from 'lucide-react';
import { getSizePrice, getUnitPrice } from '@/data/sizePrices';
import { formatRupiah } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const STEP_LABELS: { step: OrderStep; label: string }[] = [
  { step: 1, label: 'Data Siswa' },
  { step: 2, label: 'Pesanan' },
  { step: 3, label: 'Pembayaran' },
  { step: 4, label: 'Konfirmasi' },
];

function LandingView() {
  const setView = useAppStore((s) => s.setView);
  const setStep = useAppStore((s) => s.setStep);
  const setOrder = useAppStore((s) => s.setOrder);

  const handleStartOrder = () => {
    setView('order');
    setStep(1);
  };

  const handleStartOrderWithSize = (sizeAsbd: number) => {
    setOrder({ sizeAsbd });
    setView('order');
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <HeroSection onStartOrder={handleStartOrder} />
      <SizeChart onSelectSize={handleStartOrderWithSize} />
      <PaymentCard />

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="card-shadow-lg rounded-2xl hero-gradient p-6 md:p-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-12 h-12 rounded-full bg-gold-400/20 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-6 w-6 text-gold-300" />
            </div>
            <h3 className="font-heading font-bold text-xl md:text-2xl text-white mb-2">
              Sudah Siap Memesan?
            </h3>
            <p className="text-navy-200/80 text-sm md:text-base max-w-md mx-auto mb-6">
              Pilih ukuran seragam yang sesuai, lalu isi data siswa untuk mulai pemesanan.
            </p>
            <Button
              onClick={handleStartOrder}
              size="lg"
              className="bg-gold-400 hover:bg-gold-500 text-navy-900 font-semibold text-base md:text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              Mulai Pemesanan
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function OrderFormView() {
  const currentStep = useAppStore((s) => s.currentStep);
  const setStep = useAppStore((s) => s.setStep);
  const setView = useAppStore((s) => s.setView);
  const student = useAppStore((s) => s.student);
  const order = useAppStore((s) => s.order);
  const payment = useAppStore((s) => s.payment);
  const isSubmitting = useAppStore((s) => s.isSubmitting);
  const setIsSubmitting = useAppStore((s) => s.setIsSubmitting);
  const setLastOrder = useAppStore((s) => s.setLastOrder);
  const { toast } = useToast();

  const [errors, setErrors] = useState<string[]>([]);

  const validateStep = (step: OrderStep): boolean => {
    const errs: string[] = [];

    if (step === 1) {
      if (!student.name.trim()) errs.push('Nama siswa wajib diisi');
      if (!student.className.trim()) errs.push('Kelas wajib dipilih');
      if (!student.parentName.trim()) errs.push('Nama orang tua/wali wajib diisi');
      if (!student.whatsapp.trim()) errs.push('Nomor WhatsApp wajib diisi');
    } else if (step === 2) {
      if (order.sizeAsbd === 0) errs.push('Ukuran wajib dipilih');
      if (order.qty < 1) errs.push('Jumlah minimal 1');
    } else if (step === 4) {
      if (!payment.proofFile) errs.push('Bukti transfer wajib diupload');
    }

    setErrors(errs);
    if (errs.length > 0) {
      toast({
        title: 'Data belum lengkap',
        description: errs[0],
        variant: 'destructive',
      });
    }
    return errs.length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 4) {
      setStep((currentStep + 1) as OrderStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrors([]);
    if (currentStep > 1) {
      setStep((currentStep - 1) as OrderStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setErrors([]);

    try {
      const selectedSize = getSizePrice(order.sizeAsbd);
      const unitPrice = getUnitPrice(order.sizeAsbd, order.productType);
      const totalPrice = unitPrice * order.qty;

      // Read file as base64 for demo upload
      let proofUrl = '';
      if (payment.proofFile) {
        const arrayBuffer = await payment.proofFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        proofUrl = `data:${payment.proofFile.type};base64,${btoa(binary)}`;
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          className: student.className,
          parentName: student.parentName,
          whatsapp: student.whatsapp,
          notes: student.notes,
          productType: order.productType,
          sizeAsbd: order.sizeAsbd,
          chestCm: selectedSize?.chestCm || 0,
          pantsLengthCm: selectedSize?.pantsLengthCm || 0,
          pantsWaistCm: selectedSize?.pantsWaistCm || 0,
          unitPrice,
          qty: order.qty,
          totalPrice,
          senderName: student.parentName,
          senderBank: '-',
          transferDate: new Date().toISOString().split('T')[0],
          transferAmount: totalPrice,
          proofUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLastOrder(data.order);
        setView('success');
        toast({
          title: 'Pesanan berhasil!',
          description: `Pesanan ${data.order.orderNumber} telah dikirim.`,
        });
      } else {
        toast({
          title: 'Gagal mengirim pesanan',
          description: data.error || 'Terjadi kesalahan',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Gagal mengirim pesanan',
        description: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice =
    order.sizeAsbd > 0
      ? getUnitPrice(order.sizeAsbd, order.productType) * order.qty
      : 0;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} steps={STEP_LABELS} />

      {/* Cancel button */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setView('landing')}
          className="text-muted-foreground hover:text-navy-700 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Batalkan
        </Button>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-4 py-4 pb-32 md:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 1 && <StudentForm />}
            {currentStep === 2 && <ProductForm />}
            {currentStep === 3 && <PaymentStep />}
            {currentStep === 4 && <ConfirmationForm />}
          </motion.div>
        </AnimatePresence>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
            {errors.map((err, idx) => (
              <p key={idx} className="text-xs text-destructive">
                {err}
              </p>
            ))}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 flex gap-3">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 border-navy-200 text-navy-600 hover:bg-navy-50 py-5 rounded-xl font-medium cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          )}
          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              className="flex-1 bg-navy-600 hover:bg-navy-700 text-white py-5 rounded-xl font-semibold cursor-pointer"
            >
              Lanjut
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-islami-600 hover:bg-islami-700 text-white py-5 rounded-xl font-semibold cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Kirim Pesanan
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Sticky Order Summary (mobile) */}
      {totalPrice > 0 && currentStep >= 2 && <OrderSummary />}
    </div>
  );
}

export default function Home() {
  const currentView = useAppStore((s) => s.currentView);

  return (
    <main className="min-h-screen flex flex-col">
      {currentView === 'landing' && <LandingView />}
      {currentView === 'order' && <OrderFormView />}
      {currentView === 'success' && <SuccessView />}
      {currentView === 'admin' && <AdminView />}
    </main>
  );
}
