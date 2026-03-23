import { Response } from 'express';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../middlewares/authMiddleware';

// ── Validações ─────────────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-()+]{7,20}$/;
const CNPJ_REGEX = /^\d{14}$/;
const VALID_STATUS = ['ACTIVE', 'INACTIVE'] as const;

function validateClientInput(data: Record<string, unknown>, requireName = true): string | null {
  const { name, email, phone, cnpj, neighborhood, status } = data;

  if (requireName && (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 150)) {
    return 'Nome deve ter entre 2 e 150 caracteres.';
  }
  if (email !== undefined && email !== null && email !== '') {
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email) || email.length > 255) {
      return 'E-mail inválido.';
    }
  }
  if (phone !== undefined && phone !== null && phone !== '') {
    if (typeof phone !== 'string' || !PHONE_REGEX.test(phone)) {
      return 'Telefone inválido.';
    }
  }
  if (cnpj !== undefined && cnpj !== null && cnpj !== '') {
    const digits = typeof cnpj === 'string' ? cnpj.replace(/\D/g, '') : '';
    if (!CNPJ_REGEX.test(digits)) {
      return 'CNPJ deve conter 14 dígitos.';
    }
  }
  if (neighborhood !== undefined && neighborhood !== null && neighborhood !== '') {
    if (typeof neighborhood !== 'string' || neighborhood.length > 100) {
      return 'Bairro deve ter no máximo 100 caracteres.';
    }
  }
  if (status !== undefined && !VALID_STATUS.includes(status as typeof VALID_STATUS[number])) {
    return 'Status inválido. Use ACTIVE ou INACTIVE.';
  }
  return null;
}

export const getClients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.user!;
    const clients = await prisma.client.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(clients);
  } catch {
    res.status(500).json({ message: 'Erro ao buscar clientes.' });
  }
};

export const createClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.user!;
    const { name, email, phone, cnpj, neighborhood, status } = req.body as Record<string, string>;

    const validationError = validateClientInput(req.body);
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : undefined;
    const normalizedCnpj = cnpj ? cnpj.replace(/\D/g, '') : undefined;

    if (normalizedEmail) {
      const existing = await prisma.client.findFirst({ where: { email: normalizedEmail, companyId } });
      if (existing) {
        res.status(400).json({ message: 'Já existe um cliente com este e-mail.' });
        return;
      }
    }

    const newClient = await prisma.client.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone?.trim(),
        cnpj: normalizedCnpj,
        neighborhood: neighborhood?.trim(),
        status: status || 'ACTIVE',
        companyId,
      },
    });

    res.status(201).json(newClient);
  } catch {
    res.status(500).json({ message: 'Erro ao criar cliente.' });
  }
};

export const updateClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { companyId } = req.user!;
    const { name, email, phone, cnpj, neighborhood, status } = req.body as Record<string, string>;

    const validationError = validateClientInput(req.body, false);
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    // Verifica que o cliente pertence à empresa do usuário autenticado
    const client = await prisma.client.findFirst({ where: { id, companyId } });
    if (!client) {
      res.status(404).json({ message: 'Cliente não encontrado.' });
      return;
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : undefined;
    const normalizedCnpj = cnpj ? cnpj.replace(/\D/g, '') : undefined;

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(normalizedEmail !== undefined && { email: normalizedEmail }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(normalizedCnpj !== undefined && { cnpj: normalizedCnpj }),
        ...(neighborhood !== undefined && { neighborhood: neighborhood.trim() }),
        ...(status !== undefined && { status }),
      },
    });

    res.json(updatedClient);
  } catch {
    res.status(500).json({ message: 'Erro ao atualizar cliente.' });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { companyId } = req.user!;

    const client = await prisma.client.findFirst({ where: { id, companyId } });
    if (!client) {
      res.status(404).json({ message: 'Cliente não encontrado.' });
      return;
    }

    await prisma.client.delete({ where: { id } });
    res.json({ message: 'Cliente excluído com sucesso.' });
  } catch {
    res.status(500).json({ message: 'Erro ao excluir cliente.' });
  }
};