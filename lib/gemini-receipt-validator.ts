import { GoogleGenerativeAI } from '@google/generative-ai';

export interface BankAccount {
  country: 'EC' | 'MX';
  accountName: string;
  accountNumber: string;
  accountType?: string;
  identificationNumber?: string; // Cédula or CURP
  currency: 'USD' | 'MXN';
}

export interface ExtractedData {
  recipientName: string;
  recipientAccount: string;
  amount: number;
  currency: string;
  transactionDate: string;
  referenceNumber: string;
  bankName: string;
}

export interface ValidationResult {
  isValid: boolean;
  matchesAccount: boolean;
  matchesAmount: boolean;
  matchesCurrency: boolean;
  confidence: 'high' | 'medium' | 'low';
  errors?: string[];
  amountDifference?: number;
}

export interface ReceiptValidationResult {
  orderId: string;
  country: 'EC' | 'MX';
  extractedData: ExtractedData;
  validation: ValidationResult;
  rawResponse: string;
  processedAt: Date;
}

export class GeminiReceiptValidator {
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: any;
  
  private readonly bankAccounts: Record<'EC' | 'MX', BankAccount> = {
    EC: {
      country: 'EC',
      accountName: 'Carlos Maldonado',
      accountNumber: '333444555',
      accountType: 'Ahorros',
      identificationNumber: '1726037788',
      currency: 'USD'
    },
    MX: {
      country: 'MX',
      accountName: 'Daniela Briones',
      accountNumber: '999888777666',
      currency: 'MXN'
    }
  };

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is required');
    }
    
    this.genAI = new GoogleGenerativeAI(key);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-3-flash-preview' // Modelo con vision capabilities
    });
  }

  /**
   * Valida un comprobante de transferencia bancaria
   */
  async validateReceipt(
    imageBuffer: Buffer,
    country: 'EC' | 'MX',
    expectedAmount: number,
    orderId: string
  ): Promise<ReceiptValidationResult> {
    try {
      // 1. Convertir imagen a base64
      const imageBase64 = imageBuffer.toString('base64');
      
      const targetAccount = this.bankAccounts[country];
      
      // 2. Prompt optimizado para extraer y validar en una sola llamada
      const prompt = this.buildPrompt(targetAccount, expectedAmount);

      // 3. Llamar a Gemini
      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg'
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      // 4. Limpiar y parsear respuesta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se pudo extraer JSON de la respuesta de Gemini');
      }

      const data = JSON.parse(jsonMatch[0]);
      
      // 5. Validaciones adicionales
      const amountDiff = Math.abs(data.extracted.amount - expectedAmount);
      const amountToleranceOk = amountDiff < 0.5; // 50 centavos de tolerancia
      
      return {
        orderId,
        country,
        extractedData: data.extracted,
        validation: {
          ...data.validation,
          matchesAmount: amountToleranceOk,
          isValid: data.validation.isValid && amountToleranceOk,
          amountDifference: amountDiff
        },
        rawResponse: text,
        processedAt: new Date()
      };

    } catch (error) {
      console.error('Error en validación Gemini:', error);
      throw new Error('No se pudo procesar el comprobante. Por favor intenta de nuevo.');
    }
  }

  /**
   * Construye el prompt para Gemini
   */
  private buildPrompt(targetAccount: BankAccount, expectedAmount: number): string {
    const countryName = targetAccount.country === 'EC' ? 'Ecuador' : 'México';
    
    return `Analiza este comprobante de transferencia bancaria de ${countryName}.

DATOS ESPERADOS:
- Cuenta destino: ${targetAccount.accountNumber}
- Titular: ${targetAccount.accountName}
${targetAccount.identificationNumber ? `- Cédula/ID: ${targetAccount.identificationNumber}` : ''}
- Monto esperado: ${expectedAmount} ${targetAccount.currency}

INSTRUCCIONES:
1. Extrae EXACTAMENTE la información visible en el comprobante
2. Valida si coincide con los datos esperados
3. Ten en cuenta variaciones en nombres (apodos, abreviaturas)
4. Los números de cuenta pueden tener espacios o guiones

EXTRAE Y VALIDA:
- Nombre del destinatario (recipientName)
- Número de cuenta destino (recipientAccount)
- Monto transferido (amount) - SOLO el número
- Moneda (currency) - USD o MXN
- Fecha de transacción (transactionDate) - formato YYYY-MM-DD
- Número de referencia/comprobante (referenceNumber)
- Nombre del banco (bankName)

Responde SOLO con este JSON (sin markdown):
{
  "extracted": {
    "recipientName": "string",
    "recipientAccount": "string",
    "amount": number,
    "currency": "string",
    "transactionDate": "YYYY-MM-DD",
    "referenceNumber": "string",
    "bankName": "string"
  },
  "validation": {
    "isValid": boolean,
    "matchesAccount": boolean,
    "matchesAmount": boolean,
    "matchesCurrency": boolean,
    "confidence": "high|medium|low",
    "errors": ["string array de errores si hay, o array vacío"]
  }
}`;
  }

  /**
   * Determina si necesita revisión manual
   */
  needsManualReview(validation: ValidationResult): boolean {
    return (
      !validation.isValid ||
      validation.confidence === 'low' ||
      (validation.amountDifference !== undefined && validation.amountDifference > 1)
    );
  }

  /**
   * Obtiene los datos bancarios por país
   */
  getBankAccount(country: 'EC' | 'MX'): BankAccount {
    return this.bankAccounts[country];
  }

  /**
   * Obtiene todos los datos bancarios
   */
  getAllBankAccounts(): Record<'EC' | 'MX', BankAccount> {
    return this.bankAccounts;
  }
}
