import { Response } from 'express';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../middlewares/authMiddleware';

// ── Validações ─────────────────────────────────────────────────────────────────
const URL_REGEX = /^https?:\/\/.{1,2000}$/;

function validateProductInput(data: Record<string, unknown>, requireName = true): string | null {
  const { name, description, price, stock, imageUrl } = data;

  if (requireName && (!name || typeof name !== 'string' || name.trim().length < 1 || name.length > 200)) {
    return 'Nome do produto deve ter entre 1 e 200 caracteres.';
  }
  if (description !== undefined && description !== null && description !== '') {
    if (typeof description !== 'string' || description.length > 1000) {
      return 'Descrição deve ter no máximo 1000 caracteres.';
    }
  }
  if (price !== undefined) {
    const parsed = parseFloat(String(price));
    if (isNaN(parsed) || parsed < 0 || parsed > 9_999_999) {
      return 'Preço inválido. Deve ser um número entre 0 e 9.999.999.';
    }
  }
  if (stock !== undefined) {
    const parsed = parseInt(String(stock), 10);
    if (isNaN(parsed) || parsed < 0 || parsed > 9_999_999) {
      return 'Estoque inválido. Deve ser um número inteiro entre 0 e 9.999.999.';
    }
  }
  if (imageUrl !== undefined && imageUrl !== null && imageUrl !== '') {
    if (typeof imageUrl !== 'string' || !URL_REGEX.test(imageUrl)) {
      return 'URL da imagem inválida. Deve começar com http:// ou https://.';
    }
  }
  return null;
}

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.user!;
    const products = await prisma.product.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch {
    res.status(500).json({ message: 'Erro ao buscar produtos.' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.user!;
    const { name, description, price, stock, imageUrl } = req.body;

    if (!name || price === undefined) {
      res.status(400).json({ message: 'Nome e preço são obrigatórios.' });
      return;
    }

    const validationError = validateProductInput(req.body);
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name: String(name).trim(),
        description: description ? String(description).trim() : undefined,
        price: parseFloat(String(price)),
        stock: stock !== undefined ? parseInt(String(stock), 10) : 0,
        imageUrl: imageUrl ? String(imageUrl).trim() : undefined,
        companyId,
      },
    });

    res.status(201).json(product);
  } catch {
    res.status(500).json({ message: 'Erro ao criar produto.' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { companyId } = req.user!;
    const { name, description, price, stock, imageUrl } = req.body;

    const validationError = validateProductInput(req.body, false);
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    // Verifica que o produto pertence à empresa do usuário autenticado
    const existing = await prisma.product.findFirst({ where: { id, companyId } });
    if (!existing) {
      res.status(404).json({ message: 'Produto não encontrado.' });
      return;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(description !== undefined && { description: String(description).trim() }),
        ...(price !== undefined && { price: parseFloat(String(price)) }),
        ...(stock !== undefined && { stock: parseInt(String(stock), 10) }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl ? String(imageUrl).trim() : null }),
      },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Erro ao atualizar produto.' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { companyId } = req.user!;

    const existing = await prisma.product.findFirst({ where: { id, companyId } });
    if (!existing) {
      res.status(404).json({ message: 'Produto não encontrado.' });
      return;
    }

    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Produto excluído com sucesso.' });
  } catch {
    res.status(500).json({ message: 'Erro ao excluir produto.' });
  }
};