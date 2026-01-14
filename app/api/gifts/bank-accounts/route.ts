import { NextRequest, NextResponse } from 'next/server';
import { GeminiReceiptValidator } from '@/lib/gemini-receipt-validator';

export const dynamic = 'force-dynamic';

/**
 * GET /api/gifts/bank-accounts?country=EC
 * Obtiene los datos bancarios por país
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country') as 'EC' | 'MX' | null;

    const validator = new GeminiReceiptValidator();

    if (country && ['EC', 'MX'].includes(country)) {
      const account = validator.getBankAccount(country);
      
      return NextResponse.json({
        success: true,
        account: {
          country: account.country,
          bankName: account.country === 'EC' ? 'Banco Pichincha' : 'BBVA México',
          accountName: account.accountName,
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          identificationNumber: account.identificationNumber,
          currency: account.currency,
          instructions: account.country === 'EC' 
            ? 'Realiza tu transferencia a la cuenta de ahorros y envía el comprobante para validación automática.'
            : 'Realiza tu transferencia SPEI usando la CLABE y envía el comprobante para validación automática.'
        }
      });
    }

    // Retornar todas las cuentas
    const allAccounts = validator.getAllBankAccounts();
    
    return NextResponse.json({
      success: true,
      accounts: {
        EC: {
          ...allAccounts.EC,
          bankName: 'Banco Pichincha',
          instructions: 'Realiza tu transferencia a la cuenta de ahorros y envía el comprobante para validación automática.'
        },
        MX: {
          ...allAccounts.MX,
          bankName: 'BBVA México',
          instructions: 'Realiza tu transferencia SPEI usando la CLABE y envía el comprobante para validación automática.'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener datos bancarios' },
      { status: 500 }
    );
  }
}
