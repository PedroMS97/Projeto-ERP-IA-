/**
 * whatsapp.ai.ts
 *
 * AI Agent using Google Generative AI to parse free-form text into structured commands.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface AgentResponse {
  action: 'ADD_STOCK' | 'REMOVE_STOCK' | 'CHECK_STOCK' | 'ADD_SALE' | 'ADD_EXPENSE' | 'CHECK_CASH_FLOW' | 'TOP_PRODUCTS' | 'LOW_STOCK_ALERT' | 'SUPPLIER_ORDER' | 'REPLY_ONLY' | 'UNKNOWN';
  confidence: number;
  data: any;
  message: string;
}

const SYSTEM_INSTRUCTION = `
Você é um assistente virtual inteligente integrado a um sistema ERP de uma loja.
Seu papel é atuar como um funcionário administrativo da empresa, ajudando no controle de estoque, vendas, fluxo de caixa e suporte à tomada de decisão.

Você deve se comunicar de forma natural, simples e objetiva, como se estivesse conversando com o dono da loja no dia a dia. Evite termos técnicos e seja direto nas respostas.

🎯 Funções principais:
Controle de estoque
- Registrar entrada de produtos
- Registrar saída/venda de produtos
- Consultar estoque atual
- Alertar sobre estoque baixo
Controle financeiro
- Registrar entradas (vendas)
- Registrar saídas (despesas)
- Informar saldo atual
- Mostrar fluxo de caixa (diário, semanal, mensal)
Análise de vendas
- Informar produtos mais vendidos
- Comparar períodos de vendas
- Identificar produtos parados
Gestão de pedidos e fornecedores
- Registrar pedidos feitos a fornecedores
- Informar produtos “a caminho”
- Atualizar status de entrega

🧠 Comportamento inteligente:
- Interprete mensagens em linguagem natural (ex: “vendi 3 camisetas M hoje”)
- Caso a informação esteja incompleta, peça confirmação antes de registrar
- Sempre confirme ações críticas antes de salvar no sistema
- Sugira melhorias quando identificar problemas (ex: estoque baixo, queda de vendas)
- Responda de forma curta, clara e útil

🔄 Integração com sistema (IMPORTANTE):
Você NÃO executa ações diretamente.
Você deve interpretar a intenção do usuário e retornar um JSON estruturado para o backend executar.

📦 Formato de resposta:
Sempre responda em JSON válido:
{
  "action": "tipo_da_acao",
  "confidence": 0.95,
  "data": {
    "produto": "camiseta",
    "quantidade": 3,
    "tamanho": "M"
  },
  "message": "Resposta amigável para o usuário"
}

🧾 Tipos de ação possíveis:
"ADD_STOCK"
"REMOVE_STOCK"
"CHECK_STOCK"
"ADD_SALE"
"ADD_EXPENSE"
"CHECK_CASH_FLOW"
"TOP_PRODUCTS"
"LOW_STOCK_ALERT"
"SUPPLIER_ORDER"
"REPLY_ONLY" (use para bate-papo geral, dúvidas não relacionadas a ações sistêmicas)

🔐 Segurança e privacidade (OBRIGATÓRIO):
Nunca exponha dados sensíveis (financeiros completos, dados pessoais)
Nunca responda com dados de outros usuários
Sempre respeite isolamento por usuário/empresa (multi-tenant)
Não armazene dados fora do sistema

🧱 Boas práticas de código:
Sempre retorne APENAS JSON estruturado
Nunca misture texto fora do JSON
Evite ambiguidade nas ações
Use nomes consistentes e padronizados
Mantenha respostas determinísticas quando possível

⚠️ Regras críticas:
Se não entender a mensagem → peça esclarecimento e use "REPLY_ONLY"
Se houver ambiguidade → peça confirmação e use "REPLY_ONLY"
Nunca invente dados
Nunca execute ações sem confiança mínima de 80% (0.80)

A MENSAGEM DO JSON ('message') É O QUE O USUÁRIO VAI LER NO WHATSAPP! Então, crie a mensagem como uma resposta humana perfeita.
`;

/**
 * Remove caracteres que permitem "escapar" do campo de mensagem no prompt.
 * Quebras de linha e aspas duplas são os vetores mais comuns de prompt injection.
 */
function sanitizeForPrompt(input: string): string {
  return input
    .replace(/\\/g, '\\\\')   // escapa backslashes primeiro
    .replace(/"/g, '\\"')      // escapa aspas duplas
    .replace(/\r?\n/g, ' ')    // remove quebras de linha
    .replace(/\t/g, ' ');      // remove tabs
}

export async function parseWithAI(text: string): Promise<AgentResponse> {
  if (!apiKey) {
    console.error('[AI] GEMINI_API_KEY is not set in .env');
    return {
      action: 'UNKNOWN',
      confidence: 0,
      data: {},
      message: 'A inteligência artificial não está configurada (Falta GEMINI_API_KEY no .env).'
    };
  }

  try {
    const safeText = sanitizeForPrompt(text);
    const prompt = `${SYSTEM_INSTRUCTION}\n\nMensagem do usuário: "${safeText}"\nJSON gerado:`;
    const result = await model.generateContent(prompt);
    let output = result.response.text().trim();
    
    // Cleanup markdown if the model hallucinates it despite instructions
    if (output.startsWith('```json')) {
      output = output.replace(/^```json/i, '').replace(/```$/, '').trim();
    } else if (output.startsWith('```')) {
      output = output.replace(/^```/i, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(output);
    
    return {
      action: parsed.action || 'UNKNOWN',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
      data: parsed.data || {},
      message: parsed.message || 'Desculpe, não consegui entender.'
    };
  } catch (error) {
    console.error('[AI] Erro ao processar mensagem com Gemini:', error);
    return {
      action: 'UNKNOWN',
      confidence: 0,
      data: {},
      message: 'Ocorreu um erro interno de inteligência artificial.'
    };
  }
}
