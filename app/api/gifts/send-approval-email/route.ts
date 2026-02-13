import { NextRequest, NextResponse } from 'next/server';
import { sendTransactionApprovedEmail } from '@/lib/email';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/gifts/send-approval-email
 * Envía un email de aprobación para una transacción
 */
export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'transactionId requerido' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Obtener datos de la transacción
    const { data: transaction, error } = await supabase
      .from('gift_transactions')
      .select(`
        id,
        donor_name,
        donor_email,
        amount,
        created_at,
        status,
        gift:gifts (
          name,
          image_url
        )
      `)
      .eq('id', transactionId)
      .single() as {
        data: {
          id: string;
          donor_name: string;
          donor_email: string;
          amount: number;
          created_at: string;
          status: string;
          gift: {
            name: string;
            image_url: string | null;
          } | null;
        } | null;
        error: any;
      };

    if (error || !transaction) {
      return NextResponse.json(
        { success: false, error: 'Transacción no encontrada' },
        { status: 404 }
      );
    }

    // Solo enviar email si está aprobada
    if (transaction.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'La transacción no está aprobada' },
        { status: 400 }
      );
    }

    // Enviar email
    await sendTransactionApprovedEmail({
      donorName: transaction.donor_name,
      donorEmail: transaction.donor_email,
      amount: transaction.amount,
      transactionId: transaction.id,
      transactionDate: transaction.created_at,
      giftName: transaction.gift?.name,
      giftImage: transaction.gift?.image_url || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Email enviado exitosamente',
    });

  } catch (error) {
    console.error('Error sending approval email:', error);
    return NextResponse.json(
      { success: false, error: 'Error al enviar el email' },
      { status: 500 }
    );
  }
}
