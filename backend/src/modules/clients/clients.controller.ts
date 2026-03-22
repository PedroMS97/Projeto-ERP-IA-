import { Response } from 'express';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../middlewares/authMiddleware';

export const getClients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.user;
    const clients = await prisma.client.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clients' });
  }
};

export const createClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.user;
    const { name, email, phone, cnpj, neighborhood, status } = req.body;
    
    // Check if client email/cnpj already exists for this company
    if (email) {
      const existing = await prisma.client.findFirst({ where: { email, companyId } });
      if (existing) {
         res.status(400).json({ message: 'Client with this email already exists' });
         return;
      }
    }

    const newClient = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        cnpj,
        neighborhood,
        status: status || 'ACTIVE',
        companyId,
      },
    });

    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ message: 'Error creating client' });
  }
};

export const updateClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { companyId } = req.user;
    const { name, email, phone, cnpj, neighborhood, status } = req.body;

    // Verify ownership
    const client = await prisma.client.findFirst({ where: { id, companyId } });
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    const updatedClient = await prisma.client.update({
      where: { id },
      data: { name, email, phone, cnpj, neighborhood, status },
    });

    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: 'Error updating client' });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { companyId } = req.user;

    const client = await prisma.client.findFirst({ where: { id, companyId } });
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }

    await prisma.client.delete({ where: { id } });
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting client' });
  }
};
