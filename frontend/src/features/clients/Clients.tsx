import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  Plus, Search, MoreVertical, Edit2, Trash2,
  X, User, Mail, Phone, Hash, Building2, Loader2, AlertTriangle, CheckCircle2,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cnpj: string | null;
  neighborhood: string | null;
  status: string;
  createdAt: string;
}

interface ClientForm {
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  neighborhood: string;
  status: string;
}

const INITIAL_FORM: ClientForm = {
  name: '', email: '', phone: '', cnpj: '', neighborhood: '', status: 'ACTIVE',
};

// ─────────────────────────────────────────────────────────
// Shared: Customer Form Fields (used in both Add & Edit)
// ─────────────────────────────────────────────────────────
interface FormFieldsProps {
  form: ClientForm;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const CustomerFormFields = ({ form, onChange }: FormFieldsProps) => (
  <div className="space-y-5">
    {/* Customer Name */}
    <div>
      <label className="block text-xs font-extrabold text-textMuted uppercase tracking-widest mb-2">
        Customer Name <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <User className="absolute left-4 top-3.5 text-gray-400" size={17} />
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Ex: Empresa ABC Ltda"
          className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition placeholder-gray-400"
        />
      </div>
    </div>

    {/* Email + Phone */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-extrabold text-textMuted uppercase tracking-widest mb-2">Email</label>
        <div className="relative">
          <Mail className="absolute left-4 top-3.5 text-gray-400" size={17} />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="email@empresa.com"
            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition placeholder-gray-400"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-extrabold text-textMuted uppercase tracking-widest mb-2">Phone</label>
        <div className="relative">
          <Phone className="absolute left-4 top-3.5 text-gray-400" size={17} />
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="(11) 99999-9999"
            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition placeholder-gray-400"
          />
        </div>
      </div>
    </div>

    {/* CNPJ */}
    <div>
      <label className="block text-xs font-extrabold text-textMuted uppercase tracking-widest mb-2">CNPJ</label>
      <div className="relative">
        <Hash className="absolute left-4 top-3.5 text-gray-400" size={17} />
        <input
          name="cnpj"
          value={form.cnpj}
          onChange={onChange}
          placeholder="00.000.000/0001-00"
          className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition placeholder-gray-400"
        />
      </div>
    </div>

    {/* Neighborhood + Status */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-extrabold text-textMuted uppercase tracking-widest mb-2">Neighborhood</label>
        <div className="relative">
          <Building2 className="absolute left-4 top-3.5 text-gray-400" size={17} />
          <input
            name="neighborhood"
            value={form.neighborhood}
            onChange={onChange}
            placeholder="Bairro"
            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition placeholder-gray-400"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-extrabold text-textMuted uppercase tracking-widest mb-2">Status</label>
        <select
          name="status"
          value={form.status}
          onChange={onChange}
          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
// Shared: Modal Backdrop
// ─────────────────────────────────────────────────────────
const Backdrop = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ backgroundColor: 'rgba(10,10,20,0.55)', backdropFilter: 'blur(4px)' }}
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    {children}
    <style>{`
      @keyframes modalIn {
        from { opacity: 0; transform: scale(0.88) translateY(24px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
    `}</style>
  </div>
);

// ─────────────────────────────────────────────────────────
// Add Customer Modal
// ─────────────────────────────────────────────────────────
interface AddModalProps { onClose: () => void; onSuccess: () => void; }

const AddCustomerModal = ({ onClose, onSuccess }: AddModalProps) => {
  const [form, setForm] = useState<ClientForm>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: ClientForm) => api.post('/clients', data),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err: any) => setError(err?.response?.data?.message || 'Erro ao adicionar cliente.'),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('O nome do cliente é obrigatório.'); return; }
    setError(null);
    mutation.mutate(form);
  };

  return (
    <Backdrop onClose={onClose}>
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: 'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-indigo-600 p-7 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Add New Customer</h2>
            <p className="text-indigo-200 text-sm font-medium mt-0.5">Preencha os dados do novo cliente</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-colors">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}
          <CustomerFormFields form={form} onChange={handleChange} />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3.5 rounded-xl border border-gray-200 text-textMuted font-extrabold text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-70">
              {mutation.isPending
                ? <><Loader2 size={17} className="animate-spin" /> Saving...</>
                : <><Plus size={17} strokeWidth={2.5} /> Add Customer</>}
            </button>
          </div>
        </form>
      </div>
    </Backdrop>
  );
};

// ─────────────────────────────────────────────────────────
// Edit Customer Modal
// ─────────────────────────────────────────────────────────
interface EditModalProps { client: Client; onClose: () => void; onSuccess: () => void; }

const EditCustomerModal = ({ client, onClose, onSuccess }: EditModalProps) => {
  const [form, setForm] = useState<ClientForm>({
    name: client.name,
    email: client.email || '',
    phone: client.phone || '',
    cnpj: client.cnpj || '',
    neighborhood: client.neighborhood || '',
    status: client.status,
  });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: ClientForm) => api.put(`/clients/${client.id}`, data),
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err: any) => setError(err?.response?.data?.message || 'Erro ao atualizar cliente.'),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('O nome do cliente é obrigatório.'); return; }
    setError(null);
    mutation.mutate(form);
  };

  return (
    <Backdrop onClose={onClose}>
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: 'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}>
        {/* Header — amber gradient para diferenciar do Add */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-7 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Edit Customer</h2>
            <p className="text-violet-200 text-sm font-medium mt-0.5">
              Atualize os dados de <span className="font-extrabold text-white">{client.name}</span>
            </p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center text-white transition-colors">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}
          <CustomerFormFields form={form} onChange={handleChange} />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3.5 rounded-xl border border-gray-200 text-textMuted font-extrabold text-sm hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-indigo-600 hover:to-violet-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98] disabled:opacity-70">
              {mutation.isPending
                ? <><Loader2 size={17} className="animate-spin" /> Saving...</>
                : <><CheckCircle2 size={17} strokeWidth={2.5} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </Backdrop>
  );
};

// ─────────────────────────────────────────────────────────
// Delete Confirmation Dialog
// ─────────────────────────────────────────────────────────
interface DeleteDialogProps { client: Client; onClose: () => void; onSuccess: () => void; }

const DeleteConfirmDialog = ({ client, onClose, onSuccess }: DeleteDialogProps) => {
  const mutation = useMutation({
    mutationFn: () => api.delete(`/clients/${client.id}`),
    onSuccess: () => { onSuccess(); onClose(); },
  });

  return (
    <Backdrop onClose={onClose}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: 'modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div className="p-8 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5 shadow-inner">
            <AlertTriangle size={36} className="text-red-500" strokeWidth={2} />
          </div>

          <h2 className="text-xl font-extrabold text-text tracking-tight">Excluir Cliente?</h2>
          <p className="text-textMuted text-sm font-medium mt-2 max-w-xs">
            Você realmente deseja excluir o cliente{' '}
            <span className="font-extrabold text-text">"{client.name}"</span>?
            <br />
            <span className="text-red-500 font-bold">Esta ação não pode ser desfeita.</span>
          </p>

          {mutation.isError && (
            <div className="mt-4 w-full bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold">
              Erro ao excluir. Tente novamente.
            </div>
          )}

          <div className="flex gap-3 w-full mt-8">
            <button
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-text font-extrabold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Não, Cancelar
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-rose-600 hover:to-red-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {mutation.isPending
                ? <><Loader2 size={17} className="animate-spin" /> Excluindo...</>
                : <><Trash2 size={17} strokeWidth={2.5} /> Sim, Excluir</>}
            </button>
          </div>
        </div>
      </div>
    </Backdrop>
  );
};

// ─────────────────────────────────────────────────────────
// Main Clients Page
// ─────────────────────────────────────────────────────────
const PAGE_SIZE = 4;

export const Clients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const queryClient = useQueryClient();

  const { data: clients, isLoading, isError } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await api.get('/clients');
      return response.data;
    },
  });

  const filteredClients = clients?.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cnpj?.includes(searchTerm)
  ) || [];

  // ── Pagination calculations ──
  const totalPages = Math.ceil(filteredClients.length / PAGE_SIZE);
  const pagedClients = filteredClients.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const firstEntry = filteredClients.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastEntry = Math.min(currentPage * PAGE_SIZE, filteredClients.length);

  // Reset to page 1 whenever the search term changes
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // If current page becomes invalid after a deletion (e.g. was on page 2, now only 1 page exists),
  // snap back to the last valid page automatically
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['clients'] });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pt-2">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-[28px] font-extrabold text-text tracking-tight">Customers</h2>
          <p className="text-textMuted font-medium mt-1">Manage your clients and their information</p>
        </div>
        <button
          id="add-customer-btn"
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-card rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-background border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm font-semibold placeholder-gray-400"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <select className="bg-background border border-gray-200 rounded-xl text-sm px-5 py-3 text-text font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 outline-none">
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-textMuted text-[13px] uppercase tracking-wider font-extrabold border-b border-gray-100">
                <th className="px-6 py-5">Customer Name</th>
                <th className="px-6 py-5">Contact</th>
                <th className="px-6 py-5">CNPJ</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Added</th>
                <th className="px-6 py-5 text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-textMuted font-bold text-base">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={20} className="animate-spin text-primary" />
                      Loading customers...
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-danger font-bold text-base">
                    Failed to load customers
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-textMuted font-bold">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <Search className="text-gray-400" size={28} />
                      </div>
                      <span>No customers found</span>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="mt-1 text-primary text-sm font-bold hover:underline"
                      >
                        + Add your first customer
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedClients.map((client) => (
                  <tr key={client.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-primary font-bold shadow-sm border border-white text-lg flex-shrink-0">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-extrabold text-text text-[15px]">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-text">{client.email || '-'}</span>
                        <span className="text-xs text-textMuted mt-1 font-semibold">{client.phone || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-textMuted font-bold">{client.cnpj || '-'}</td>
                    <td className="px-6 py-5">
                      <span className={`px-4 py-1.5 rounded-lg text-xs font-extrabold tracking-wide ${
                        client.status === 'ACTIVE'
                          ? 'bg-[#e4f8f0] text-[#00ac69]'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-textMuted font-semibold">
                      {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {/* Action buttons — sempre visíveis ao hover da linha */}
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          title="Editar cliente"
                          onClick={() => setEditingClient(client)}
                          className="p-2 hover:bg-indigo-50 rounded-lg text-textMuted hover:text-primary transition-colors shadow-sm"
                        >
                          <Edit2 size={16} strokeWidth={2.5} />
                        </button>
                        <button
                          title="Excluir cliente"
                          onClick={() => setDeletingClient(client)}
                          className="p-2 hover:bg-red-50 rounded-lg text-textMuted hover:text-red-500 transition-colors shadow-sm"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-text md:hidden">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-5 border-t border-gray-100 flex items-center justify-between text-sm text-textMuted font-medium bg-gray-50/30">
          <p className="pl-2">
            Showing <span className="text-text font-bold">{firstEntry}</span> to{' '}
            <span className="text-text font-bold">{lastEntry}</span> of{' '}
            <span className="text-text font-bold">{filteredClients.length}</span> entries
          </p>

          {/* Only render pagination controls when there is more than one page */}
          {totalPages > 1 && (
            <div className="flex gap-1.5 mr-2">
              {/* Previous */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors border border-transparent shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &lt;
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-all ${
                    page === currentPage
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                      : 'hover:bg-white text-text shadow-sm'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors border border-transparent shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onSuccess={invalidate}
        />
      )}

      {editingClient && (
        <EditCustomerModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSuccess={invalidate}
        />
      )}

      {deletingClient && (
        <DeleteConfirmDialog
          client={deletingClient}
          onClose={() => setDeletingClient(null)}
          onSuccess={invalidate}
        />
      )}
    </div>
  );
};

export default Clients;
