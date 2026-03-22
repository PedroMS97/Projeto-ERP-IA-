import { Response } from 'express';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../middlewares/authMiddleware';

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.user;
    const products = await prisma.product.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch {
    res.status(500).json({ message: 'Error fetching products' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.user;
    const { name, description, price, stock, imageUrl } = req.body;

    if (!name || price === undefined) {
      res.status(400).json({ message: 'Name and price are required' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock ?? 0),
        imageUrl,
        companyId,
      },
    });

    res.status(201).json(product);
  } catch {
    res.status(500).json({ message: 'Error creating product' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { companyId } = req.user;
    const { name, description, price, stock, imageUrl } = req.body;

    const existing = await prisma.product.findFirst({ where: { id, companyId } });
    if (!existing) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: price !== undefined ? parseFloat(price) : existing.price,
        stock: stock !== undefined ? parseInt(stock) : existing.stock,
        imageUrl,
      },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Error updating product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { companyId } = req.user;

    const existing = await prisma.product.findFirst({ where: { id, companyId } });
    if (!existing) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Error deleting product' });
  }
};
