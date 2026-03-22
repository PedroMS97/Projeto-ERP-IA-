import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  Plus, Loader2, Search, Trash2, Edit2, AlertTriangle,
  CheckCircle2, Package, ImageIcon, MoreVertical,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  createdAt: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
}

const emptyForm: ProductForm = { name: '', description: '', price: '', stock: '0', imageUrl: '' };

// ─── Backdrop ────────────────────────────────────────────────────────────────
const Backdrop = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    style={{ animation: 'fadeIn 0.15s ease' }}
  >
    {children}
    <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes modalIn{from{opacity:0;transform:scale(0.95) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
  </div>
);

// ─── Product Form Fields ──────────────────────────────────────────────────────
const field = (
  label: string,
  id: string,
  value: string,
  onChange: (v: string) => void,
  props?: React.InputHTMLAttributes<HTMLInputElement>
) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-background border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm font-semibold placeholder-gray-400"
      {...props}
    />
  </div>
);

// ─── Image Preview ────────────────────────────────────────────────────────────
const ImagePreview = ({ url }: { url: string }) => (
  <div className="w-full h-36 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
    {url ? (
      <img src={url} alt="preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
    ) : (
      <div className="flex flex-col items-center gap-2 text-gray-300">
        <ImageIcon size={32} />
        <span className="text-xs font-semibold">Preview da imagem</span>
      </div>
    )}
  </div>
);

// ─── Add Modal ───────────────────────────────────────────────────────────────
interface AddModalProps { onClose: () => void; onSuccess: () => void; }

const AddProductModal = ({ onClose, onSuccess }: AddModalProps) => {
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [error, setError] = useState('');
  const set = (k: keyof ProductForm) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: () => api.post('/products', {
      name: form.name.trim(),
      description: form.description || undefined,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      imageUrl: form.imageUrl || undefined,
    }),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: () => setError('Erro ao cadastrar produto. Verifique os dados.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Nome do produto é obrigatório.'); return; }
    if (!form.price || isNaN(parseFloat(form.price))) { setError('Informe um preço válido.'); return; }
    mutation.mutate();
  };

  return (
    <Backdrop onClose={onClose}>
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ animation: 'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}>
        {/* Header */}
        <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-primary to-indigo-600">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 shadow-inner">
            <Package size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Novo Produto</h2>
          <p className="text-white/70 text-sm mt-1 font-medium">Preencha os dados do produto</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold">{error}</div>}

          {field('Nome do Produto *', 'p-name', form.name, set('name'), { placeholder: 'Ex: Camiseta Premium' })}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description')(e.target.value)}
              placeholder="Descreva o produto..."
              rows={2}
              className="w-full px-4 py-3 bg-background border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm font-semibold placeholder-gray-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field('Preço (R$) *', 'p-price', form.price, set('price'), { type: 'number', min: '0', step: '0.01', placeholder: '0,00' })}
            {field('Quantidade em Estoque', 'p-stock', form.stock, set('stock'), { type: 'number', min: '0', placeholder: '0' })}
          </div>

          {field('URL da Imagem', 'p-img', form.imageUrl, set('imageUrl'), { placeholder: 'https://...' })}
          <ImagePreview url={form.imageUrl} />

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-500 font-extrabold text-sm hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-70">
              {mutation.isPending ? <><Loader2 size={17} className="animate-spin" /> Salvando...</> : <><CheckCircle2 size={17} strokeWidth={2.5} /> Cadastrar Produto</>}
            </button>
          </div>
        </form>
      </div>
    </Backdrop>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────
interface EditModalProps { product: Product; onClose: () => void; onSuccess: () => void; }

const EditProductModal = ({ product, onClose, onSuccess }: EditModalProps) => {
  const [form, setForm] = useState<ProductForm>({
    name: product.name,
    description: product.description ?? '',
    price: String(product.price),
    stock: String(product.stock),
    imageUrl: product.imageUrl ?? '',
  });
  const [error, setError] = useState('');
  const set = (k: keyof ProductForm) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: () => api.put(`/products/${product.id}`, {
      name: form.name.trim(),
      description: form.description || undefined,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      imageUrl: form.imageUrl || undefined,
    }),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: () => setError('Erro ao atualizar produto.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return; }
    mutation.mutate();
  };

  return (
    <Backdrop onClose={onClose}>
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ animation: 'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-violet-600 to-indigo-600">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
            <Edit2 size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-extrabold text-white">Editar Produto</h2>
          <p className="text-white/70 text-sm mt-1 font-medium">Atualize os dados do produto</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold">{error}</div>}

          {field('Nome do Produto *', 'ep-name', form.name, set('name'))}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Descrição</label>
            <textarea value={form.description} onChange={(e) => set('description')(e.target.value)} rows={2}
              className="w-full px-4 py-3 bg-background border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition text-sm font-semibold placeholder-gray-400 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field('Preço (R$)', 'ep-price', form.price, set('price'), { type: 'number', min: '0', step: '0.01' })}
            {field('Estoque', 'ep-stock', form.stock, set('stock'), { type: 'number', min: '0' })}
          </div>
          {field('URL da Imagem', 'ep-img', form.imageUrl, set('imageUrl'), { placeholder: 'https://...' })}
          <ImagePreview url={form.imageUrl} />

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-500 font-extrabold text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-indigo-600 hover:to-violet-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98] disabled:opacity-70">
              {mutation.isPending ? <><Loader2 size={17} className="animate-spin" /> Salvando...</> : <><CheckCircle2 size={17} strokeWidth={2.5} /> Salvar Alterações</>}
            </button>
          </div>
        </form>
      </div>
    </Backdrop>
  );
};

// ─── Delete Dialog ────────────────────────────────────────────────────────────
interface DeleteDialogProps { product: Product; onClose: () => void; onSuccess: () => void; }

const DeleteProductDialog = ({ product, onClose, onSuccess }: DeleteDialogProps) => {
  const mutation = useMutation({
    mutationFn: () => api.delete(`/products/${product.id}`),
    onSuccess: () => { onSuccess(); onClose(); },
  });

  return (
    <Backdrop onClose={onClose}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5 shadow-inner">
            <AlertTriangle size={36} className="text-red-500" strokeWidth={2} />
          </div>
          <h2 className="text-xl font-extrabold text-text tracking-tight">Excluir Produto?</h2>
          <p className="text-gray-500 text-sm font-medium mt-2 max-w-xs">
            Você realmente deseja excluir{' '}
            <span className="font-extrabold text-text">"{product.name}"</span>?<br />
            <span className="text-red-500 font-bold">Esta ação não pode ser desfeita.</span>
          </p>
          {mutation.isError && <div className="mt-4 w-full bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold">Erro ao excluir. Tente novamente.</div>}
          <div className="flex gap-3 w-full mt-8">
            <button onClick={onClose} disabled={mutation.isPending} className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-text font-extrabold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
              Não, Cancelar
            </button>
            <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-rose-600 hover:to-red-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 transition-all active:scale-[0.98] disabled:opacity-70">
              {mutation.isPending ? <><Loader2 size={17} className="animate-spin" /> Excluindo...</> : <><Trash2 size={17} strokeWidth={2.5} /> Sim, Excluir</>}
            </button>
          </div>
        </div>
      </div>
    </Backdrop>
  );
};

// ─── Main Products Page ───────────────────────────────────────────────────────
const PAGE_SIZE = 4;

export const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading, isError } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => (await api.get('/products')).data,
  });

  const filtered = products?.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const firstEntry = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastEntry = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const handleSearch = (v: string) => { setSearchTerm(v); setCurrentPage(1); };

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['products'] });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pt-2">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-[28px] font-extrabold text-text tracking-tight">Produtos</h2>
          <p className="text-textMuted font-medium mt-1">Gerencie seu catálogo de produtos</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-card rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-background border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition text-sm font-semibold placeholder-gray-400"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-textMuted text-[13px] uppercase tracking-wider font-extrabold border-b border-gray-100">
                <th className="px-6 py-5">Produto</th>
                <th className="px-6 py-5">Descrição</th>
                <th className="px-6 py-5">Preço</th>
                <th className="px-6 py-5">Estoque</th>
                <th className="px-6 py-5">Adicionado</th>
                <th className="px-6 py-5 text-right w-28">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr><td colSpan={6} className="py-12 text-center text-textMuted font-bold">
                  <div className="flex items-center justify-center gap-2"><Loader2 size={20} className="animate-spin text-primary" /> Carregando produtos...</div>
                </td></tr>
              ) : isError ? (
                <tr><td colSpan={6} className="py-12 text-center text-red-500 font-bold">Erro ao carregar produtos</td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-textMuted font-bold">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                      <Package className="text-gray-300" size={28} />
                    </div>
                    <span>Nenhum produto encontrado</span>
                    <button onClick={() => setShowAddModal(true)} className="mt-1 text-primary text-sm font-bold hover:underline">+ Adicionar primeiro produto</button>
                  </div>
                </td></tr>
              ) : paged.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                  {/* Product + image */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={20} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <span className="font-extrabold text-text text-[15px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-textMuted font-semibold max-w-[200px] truncate">{p.description || '-'}</td>
                  <td className="px-6 py-4 font-extrabold text-text">
                    {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-extrabold tracking-wide ${
                      p.stock > 10 ? 'bg-emerald-50 text-emerald-700' :
                      p.stock > 0  ? 'bg-amber-50 text-amber-700' :
                                     'bg-red-50 text-red-600'
                    }`}>
                      {p.stock === 0 ? 'Sem estoque' : `${p.stock} un.`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-textMuted font-semibold">
                    {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button title="Editar" onClick={() => setEditingProduct(p)}
                        className="p-2 hover:bg-indigo-50 rounded-lg text-textMuted hover:text-primary transition-colors shadow-sm">
                        <Edit2 size={16} strokeWidth={2.5} />
                      </button>
                      <button title="Excluir" onClick={() => setDeletingProduct(p)}
                        className="p-2 hover:bg-red-50 rounded-lg text-textMuted hover:text-red-500 transition-colors shadow-sm">
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-text md:hidden"><MoreVertical size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-5 border-t border-gray-100 flex items-center justify-between text-sm text-textMuted font-medium bg-gray-50/30">
          <p className="pl-2">
            Mostrando <span className="text-text font-bold">{firstEntry}</span> a{' '}
            <span className="text-text font-bold">{lastEntry}</span> de{' '}
            <span className="text-text font-bold">{filtered.length}</span> produtos
          </p>
          {totalPages > 1 && (
            <div className="flex gap-1.5 mr-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors shadow-sm disabled:opacity-30 disabled:cursor-not-allowed">&lt;</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-all ${
                    page === currentPage ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105' : 'hover:bg-white text-text shadow-sm'
                  }`}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors shadow-sm disabled:opacity-30 disabled:cursor-not-allowed">&gt;</button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} onSuccess={invalidate} />}
      {editingProduct && <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSuccess={invalidate} />}
      {deletingProduct && <DeleteProductDialog product={deletingProduct} onClose={() => setDeletingProduct(null)} onSuccess={invalidate} />}
    </div>
  );
};

export default Products;
