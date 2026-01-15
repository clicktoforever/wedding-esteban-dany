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
  private readonly bankAccounts: Record<'EC' | 'MX', BankAccount>;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is required');
    }
    
    console.log('[GeminiValidator] Initializing with API key:', key.substring(0, 10) + '...');
    
    // Cargar cuentas bancarias desde variables de entorno
    this.bankAccounts = {
      EC: {
        country: 'EC',
        accountName: process.env.BANK_ACCOUNT_EC_NAME || 'Carlos Maldonado',
        accountNumber: process.env.BANK_ACCOUNT_EC_NUMBER || '333444555',
        accountType: process.env.BANK_ACCOUNT_EC_TYPE || 'Ahorros',
        identificationNumber: process.env.BANK_ACCOUNT_EC_ID || '1726037788',
        currency: 'USD'
      },
      MX: {
        country: 'MX',
        accountName: process.env.BANK_ACCOUNT_MX_NAME || 'Daniela Guadalupe Briones Chavez',
        accountNumber: process.env.BANK_ACCOUNT_MX_CARD || '5579099012900331',
        accountType: 'Tarjeta',
        currency: 'MXN'
      }
    };
    
    console.log('[GeminiValidator] Bank accounts loaded:', {
      EC: this.bankAccounts.EC.accountNumber,
      MX: this.bankAccounts.MX.accountNumber
    });
    
    this.genAI = new GoogleGenerativeAI(key);
    console.log('[GeminiValidator] Using model: gemini-3-flash-preview');
    
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-3-flash-preview'
    });
    
    console.log('[GeminiValidator] Initialization complete');
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
    console.log(`[${orderId}] validateReceipt started for ${country} with expected amount ${expectedAmount}`);
    
    try {
      // 1. Convertir imagen a base64
      console.log(`[${orderId}] Converting buffer to base64, size: ${imageBuffer.length} bytes`);
      const imageBase64 = imageBuffer.toString('base64');
      console.log(`[${orderId}] Base64 conversion complete, length: ${imageBase64.length}`);
      
      const targetAccount = this.bankAccounts[country];
      console.log(`[${orderId}] Target account:`, targetAccount.accountName, targetAccount.accountNumber);
      
      // 2. Prompt optimizado para extraer y validar en una sola llamada
      const prompt = this.buildPrompt(targetAccount, expectedAmount);
      console.log(`[${orderId}] Prompt built, calling Gemini API...`);

      // 3. Llamar a Gemini con timeout
      const startTime = Date.now();
      console.log(`[${orderId}] Sending request to Gemini at ${new Date().toISOString()}`);
      
      // Timeout de 45 segundos para dar tiempo antes del timeout de Vercel (60s)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Gemini API timeout after 45 seconds')), 45000);
      });
      
      const geminiPromise = this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg'
          }
        }
      ]);
      
      const result = await Promise.race([geminiPromise, timeoutPromise]) as any;

      const endTime = Date.now();
      console.log(`[${orderId}] Gemini API responded in ${endTime - startTime}ms`);
      
      const response = await result.response;
      console.log(`[${orderId}] Response retrieved, extracting text...`);
      
      const text = response.text();
      console.log(`[${orderId}] Response text length: ${text.length}, first 200 chars:`, text.substring(0, 200));
      
      // 4. Limpiar y parsear respuesta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error(`[${orderId}] Failed to extract JSON from response:`, text);
        throw new Error('No se pudo extraer JSON de la respuesta de Gemini');
      }
      
      console.log(`[${orderId}] JSON extracted, parsing...`);
      const data = JSON.parse(jsonMatch[0]);
      console.log(`[${orderId}] Parsed data:`, JSON.stringify(data, null, 2));
      
      // 4.5. Verificar si la imagen es un comprobante válido
      if (!data.validation.isValid && data.validation.errors?.some((err: string) => 
        err.toLowerCase().includes('no es un comprobante') || 
        err.toLowerCase().includes('not a receipt') ||
        err.toLowerCase().includes('imagen no válida') ||
        err.toLowerCase().includes('invalid image')
      )) {
        console.error(`[${orderId}] Image is not a valid receipt`);
        throw new Error('INVALID_IMAGE: La imagen no parece ser un comprobante de transferencia bancaria válido');
      }
      
      // 5. Validaciones adicionales
      const amountDiff = Math.abs(data.extracted.amount - expectedAmount);
      const amountToleranceOk = amountDiff < 0.5; // 50 centavos de tolerancia
      
      console.log(`[${orderId}] Amount validation - Expected: ${expectedAmount}, Extracted: ${data.extracted.amount}, Diff: ${amountDiff}, Ok: ${amountToleranceOk}`);
      
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

    } catch (error: any) {
      console.error(`[${orderId}] ===== ERROR IN GEMINI VALIDATION =====`);
      console.error(`[${orderId}] Error type:`, error?.constructor?.name);
      console.error(`[${orderId}] Error message:`, error?.message);
      console.error(`[${orderId}] Error stack:`, error?.stack);
      console.error(`[${orderId}] Full error object:`, JSON.stringify(error, null, 2));
      
      // Distinguir entre imagen inválida y errores técnicos
      if (error?.message?.includes('INVALID_IMAGE:')) {
        // Error de imagen inválida - rechazar inmediatamente
        const cleanMessage = error.message.replace('INVALID_IMAGE: ', '');
        throw new Error(`INVALID_IMAGE:${cleanMessage}`);
      } else if (error?.message?.includes('timeout')) {
        // Error de timeout - marcar para revisión manual
        throw new Error('TIMEOUT:La validación tardó demasiado. Tu comprobante será revisado manualmente.');
      } else {
        // Otros errores técnicos - revisión manual
        throw new Error(`TECHNICAL_ERROR:Error al procesar el comprobante. Será revisado manualmente.`);
      }
    }
  }

  /**
   * Construye el prompt para Gemini
   */
  private buildPrompt(targetAccount: BankAccount, expectedAmount: number): string {
    const countryName = targetAccount.country === 'EC' ? 'Ecuador' : 'México';
    
    return `Analiza esta imagen y determina si es un comprobante de transferencia bancaria de ${countryName}.

PRIMERO: ¿Es esto un comprobante bancario válido?
- Si NO es un comprobante bancario (es una foto random, meme, documento diferente, etc.), responde con isValid: false y un error descriptivo.
- Si SÍ parece un comprobante bancario, procede con la validación.

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
