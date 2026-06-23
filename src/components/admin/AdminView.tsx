'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Search,
  Download,
  Lock,
  Eye,
  Shield,
  BarChart3,
  Package,
  DollarSign,
  Users,
  FileText,
} from 'lucide-react';
import { formatRupiah, formatDateTime } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type OrderStatus =
  | 'Menunggu Verifikasi'
  | 'Lunas'
  | 'Sedang Produksi'
  | 'Siap Distribusi'
  | 'Selesai';

interface OrderItem {
  id: string;
  orderNumber: string;
  createdAt: string;
  studentName: string;
  className: string;
  parentName: string;
  whatsapp: string;
  productType: string;
  sizeAsbd: number;
  qty: number;
  totalPrice: number;
  senderName: string;
  senderBank: string;
  transferAmount: number;
  status: OrderStatus;
  proofUrl: string;
  notes: string;
}

const STATUS_OPTIONS: OrderStatus[] = [
  'Menunggu Verifikasi',
  'Lunas',
  'Sedang Produksi',
  'Siap Distribusi',
  'Selesai',
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  'Menunggu Verifikasi': 'bg-amber-100 text-amber-800 border-amber-200',
  'Lunas': 'bg-islami-100 text-islami-800 border-islami-200',
  'Sedang Produksi': 'bg-blue-100 text-blue-800 border-blue-200',
  'Siap Distribusi': 'bg-purple-100 text-purple-800 border-purple-200',
  'Selesai': 'bg-gray-100 text-gray-800 border-gray-200',
};

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        onLogin();
      } else {
        setError('Password salah. Silakan coba lagi.');
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-sm card-shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-navy-100 flex items-center justify-center mx-auto mb-3">
              <Shield className="h-8 w-8 text-navy-600" />
            </div>
            <h2 className="font-heading font-bold text-xl text-navy-800">
              Admin Dashboard
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Masukkan password untuk mengakses dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 border-navy-200"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-xs text-destructive text-center">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-navy-600 hover:bg-navy-700 text-white font-semibold py-5 rounded-xl cursor-pointer"
              disabled={loading || !password}
            >
              {loading ? 'Memverifikasi...' : 'Masuk'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboard() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [proofPreviewOpen, setProofPreviewOpen] = useState(false);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string>('');
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const uniqueClasses = useMemo(
    () => [...new Set(orders.map((o) => o.className))].sort(),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !search ||
        o.studentName.toLowerCase().includes(search.toLowerCase()) ||
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.parentName.toLowerCase().includes(search.toLowerCase());
      const matchClass =
        filterClass === 'all' || o.className === filterClass;
      const matchStatus =
        filterStatus === 'all' || o.status === filterStatus;
      return matchSearch && matchClass && matchStatus;
    });
  }, [orders, search, filterClass, filterStatus]);

  // Rekap stats
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((s, o) => s + o.totalPrice, 0);
    const totalQty = orders.reduce((s, o) => s + o.qty, 0);
    return { totalOrders, totalRevenue, totalQty };
  }, [orders]);

  const handleStatusChange = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: newStatus,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: 'Status diperbarui',
          description: `Pesanan ${selectedOrder.orderNumber} statusnya diubah menjadi "${newStatus}".`,
        });
        fetchOrders();
        setStatusDialogOpen(false);
        setSelectedOrder(null);
        setNewStatus('');
      }
    } catch {
      toast({
        title: 'Gagal memperbarui',
        description: 'Terjadi kesalahan saat memperbarui status.',
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'No Pesanan',
      'Tanggal',
      'Nama Siswa',
      'Kelas',
      'Nama Orang Tua',
      'WhatsApp',
      'Produk',
      'Ukuran',
      'Qty',
      'Total Harga',
      'Nama Pengirim',
      'Bank Pengirim',
      'Nominal Transfer',
      'Status',
      'Catatan',
    ];

    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      o.createdAt,
      o.studentName,
      o.className,
      o.parentName,
      o.whatsapp,
      o.productType,
      String(o.sizeAsbd),
      String(o.qty),
      String(o.totalPrice),
      o.senderName,
      o.senderBank,
      String(o.transferAmount),
      o.status,
      o.notes,
    ]);

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pesanan-asbd-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => useAppStore.getState().setView('landing')}
          className="cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali
        </Button>
        <h1 className="font-heading font-bold text-xl text-navy-800">
          Dashboard Admin
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="card-shadow rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-navy-500" />
              <span className="text-xs text-muted-foreground">Total Pesanan</span>
            </div>
            <p className="font-heading font-bold text-2xl text-navy-800">{stats.totalOrders}</p>
          </CardContent>
        </Card>
        <Card className="card-shadow rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-islami-500" />
              <span className="text-xs text-muted-foreground">Total Omzet</span>
            </div>
            <p className="font-heading font-bold text-lg text-navy-800">
              {formatRupiah(stats.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card className="card-shadow rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-gold-500" />
              <span className="text-xs text-muted-foreground">Total Qty</span>
            </div>
            <p className="font-heading font-bold text-2xl text-navy-800">{stats.totalQty}</p>
          </CardContent>
        </Card>
        <Card className="card-shadow rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Kelas</span>
            </div>
            <p className="font-heading font-bold text-2xl text-navy-800">{uniqueClasses.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-shadow rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama siswa, nomor pesanan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-navy-200"
              />
            </div>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-full md:w-40 border-navy-200">
                <SelectValue placeholder="Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {uniqueClasses.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48 border-navy-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="border-navy-200 text-navy-600 hover:bg-navy-50 cursor-pointer"
            >
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="card-shadow rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-navy-50 border-navy-100">
                  <TableHead className="font-semibold text-navy-700 text-xs whitespace-nowrap">
                    No Pesanan
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700 text-xs whitespace-nowrap">
                    Tanggal
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700 text-xs whitespace-nowrap">
                    Siswa
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700 text-xs whitespace-nowrap">
                    Kelas
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700 text-xs whitespace-nowrap">
                    Produk
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700 text-xs whitespace-nowrap">
                    Ukuran
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700 text-xs whitespace-nowrap">
                    Qty
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700 text-xs whitespace-nowrap text-right">
                    Total
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700 text-xs whitespace-nowrap">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-navy-700 text-xs whitespace-nowrap">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Tidak ada pesanan ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-navy-50/30">
                      <TableCell className="font-mono text-xs font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {formatDateTime(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {order.studentName}
                      </TableCell>
                      <TableCell className="text-xs">{order.className}</TableCell>
                      <TableCell className="text-xs">{order.productType}</TableCell>
                      <TableCell className="text-xs text-center">
                        <Badge variant="outline" className="text-[10px] border-navy-300">
                          {order.sizeAsbd}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-center">{order.qty}</TableCell>
                      <TableCell className="text-xs text-right font-semibold">
                        {formatRupiah(order.totalPrice)}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${STATUS_COLORS[order.status]}`}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex gap-1">
                          {order.proofUrl && (
                            <button
                              onClick={() => {
                                setProofPreviewUrl(order.proofUrl);
                                setProofPreviewOpen(true);
                              }}
                              className="p-1 rounded hover:bg-navy-100 transition-colors cursor-pointer"
                              title="Lihat bukti transfer"
                            >
                              <Eye className="h-3.5 w-3.5 text-navy-500" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewStatus(order.status);
                              setStatusDialogOpen(true);
                            }}
                            className="p-1 rounded hover:bg-navy-100 transition-colors cursor-pointer"
                            title="Ubah status"
                          >
                            <BarChart3 className="h-3.5 w-3.5 text-navy-500" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Proof Preview Dialog */}
      <Dialog open={proofPreviewOpen} onOpenChange={setProofPreviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Bukti Transfer</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3">
            {proofPreviewUrl.startsWith('data:image/') ? (
              <img
                src={proofPreviewUrl}
                alt="Bukti Transfer"
                className="w-full max-h-[60vh] object-contain rounded-lg border border-gray-200"
              />
            ) : proofPreviewUrl.startsWith('data:application/pdf') ? (
              <div className="w-full text-center p-6 bg-red-50 rounded-lg border border-red-200">
                <FileText className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <p className="text-sm text-red-700 font-medium">File PDF</p>
                <p className="text-xs text-red-600 mt-1">Preview PDF tidak tersedia di browser</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Format bukti tidak dikenali.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Ubah Status Pesanan</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="text-sm">
                <p className="text-muted-foreground">Pesanan</p>
                <p className="font-medium">
                  {selectedOrder.orderNumber} — {selectedOrder.studentName}
                </p>
              </div>
              <Select
                value={newStatus}
                onValueChange={(v) => setNewStatus(v as OrderStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={!newStatus}
              className="bg-navy-600 hover:bg-navy-700 text-white cursor-pointer"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AdminView() {
  const adminAuthenticated = useAppStore((s) => s.adminAuthenticated);
  const setAdminAuthenticated = useAppStore((s) => s.setAdminAuthenticated);
  const setView = useAppStore((s) => s.setView);

  if (!adminAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('landing')}
            className="cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
        </div>
        <AdminLogin onLogin={() => setAdminAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <AdminDashboard />
    </div>
  );
}
