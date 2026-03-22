/**
 * whatsapp.service.ts
 *
 * Business logic layer — completely decoupled from Baileys.
 * All inventory operations go through here and are persisted in PostgreSQL.
 */

import { prisma } from '../../config/prisma';

export interface InventoryResult {
  success: boolean;
  message: string;
  product?: {
    name: string;
    size: string | null;
    stockAfter: number;
  };
}

/**
 * Finds a product by name (case-insensitive, partial match) and optional size.
 * Returns the first match within the given company.
 */
async function findProduct(companyId: string, productName: string, size?: string) {
  return prisma.product.findFirst({
    where: {
      companyId,
      name: { contains: productName, mode: 'insensitive' },
      ...(size ? { size: { equals: size, mode: 'insensitive' } } : {}),
    },
  });
}

/** Register a stock entry (+qty) and persist a movement record */
export async function processEntry(
  companyId: string,
  productName: string,
  quantity: number,
  jid: string,
  size?: string,
): Promise<InventoryResult> {
  const product = await findProduct(companyId, productName, size);

  if (!product) {
    const sizeHint = size ? ` tamanho ${size}` : '';
    return {
      success: false,
      message: `❌ Produto *${productName}*${sizeHint} não encontrado no cadastro.\nVerifique o nome e tente novamente.`,
    };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedProduct = await tx.product.update({
      where: { id: product.id },
      data: { stock: { increment: quantity } },
    });

    await tx.inventoryMovement.create({
      data: {
        productId: product.id,
        type: 'ENTRADA',
        quantity,
        source: 'WHATSAPP',
        whatsappJid: jid,
        companyId,
      },
    });

    return updatedProduct;
  });

  return {
    success: true,
    message:
      `✅ *Entrada registrada!*\n` +
      `📦 ${updated.name}${updated.size ? ` (${updated.size})` : ''}\n` +
      `➕ +${quantity} unidades\n` +
      `🗃️ Estoque atual: *${updated.stock}*`,
    product: { name: updated.name, size: updated.size, stockAfter: updated.stock },
  };
}

/** Register a stock exit (-qty) with validation */
export async function processExit(
  companyId: string,
  productName: string,
  quantity: number,
  jid: string,
  size?: string,
): Promise<InventoryResult> {
  const product = await findProduct(companyId, productName, size);

  if (!product) {
    const sizeHint = size ? ` tamanho ${size}` : '';
    return {
      success: false,
      message: `❌ Produto *${productName}*${sizeHint} não encontrado no cadastro.`,
    };
  }

  if (product.stock < quantity) {
    return {
      success: false,
      message:
        `❌ *Estoque insuficiente!*\n` +
        `📦 ${product.name}${product.size ? ` (${product.size})` : ''}\n` +
        `🗃️ Disponível: *${product.stock}* | Solicitado: *${quantity}*`,
    };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedProduct = await tx.product.update({
      where: { id: product.id },
      data: { stock: { decrement: quantity } },
    });

    await tx.inventoryMovement.create({
      data: {
        productId: product.id,
        type: 'SAIDA',
        quantity,
        source: 'WHATSAPP',
        whatsappJid: jid,
        companyId,
      },
    });

    return updatedProduct;
  });

  return {
    success: true,
    message:
      `✅ *Saída registrada!*\n` +
      `📦 ${updated.name}${updated.size ? ` (${updated.size})` : ''}\n` +
      `➖ -${quantity} unidades\n` +
      `🗃️ Estoque atual: *${updated.stock}*`,
    product: { name: updated.name, size: updated.size, stockAfter: updated.stock },
  };
}

/** Query current stock */
export async function queryStock(
  companyId: string,
  productName: string,
  size?: string,
): Promise<InventoryResult> {
  const product = await findProduct(companyId, productName, size);

  if (!product) {
    const sizeHint = size ? ` tamanho ${size}` : '';
    return {
      success: false,
      message: `❌ Produto *${productName}*${sizeHint} não encontrado.`,
    };
  }

  return {
    success: true,
    message:
      `📦 *${product.name}*${product.size ? ` (${product.size})` : ''}\n` +
      `🗃️ Estoque: *${product.stock} unidades*`,
    product: { name: product.name, size: product.size, stockAfter: product.stock },
  };
}
