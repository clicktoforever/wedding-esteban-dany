import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GeminiReceiptValidator } from '@/lib/gemini-receipt-validator';
import type { Database } from '@/lib/database.types';
import { usdToMxn } from '@/lib/currency';

type Gift = Database['public']['Tables']['gifts']['Row'];
type GiftTransaction = Database['public']['Tables']['gift_transactions']['Row'];

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/gifts/transfer
 * Procesa una transferencia bancaria con comprobante
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const giftId = formData.get('giftId') as string;
    const donorName = formData.get('donorName') as string;
    const amount = Number.parseFloat(formData.get('amount') as string); // En USD
    const displayAmount = Number.parseFloat(formData.get('displayAmount') as string); // En moneda original
    const displayCurrency = formData.get('displayCurrency') as 'USD' | 'MXN';
    const country = formData.get('country') as 'EC' | 'MX';
    const message = formData.get('message') as string | null;
    const receiptFile = formData.get('receipt') as File;

    // Validaciones
    if (!giftId || !donorName || !amount || !displayAmount || !country || !receiptFile) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    if (!['EC', 'MX'].includes(country)) {
      return NextResponse.json(
        { success: false, error: 'País no válido' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Monto inválido' },
        { status: 400 }
      );
    }

    // Validar tipo y tamaño de archivo
    if (!receiptFile.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Solo se permiten imágenes' },
        { status: 400 }
      );
    }

    if (receiptFile.size > 5 * 1024 * 1024) { // 5MB
      return NextResponse.json(
        { success: false, error: 'La imagen no debe superar 5MB' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Verificar que el regalo existe y tiene saldo disponible
    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .select('id, name, total_amount, collected_amount, status')
      .eq('id', giftId)
      .single<Gift>();

    if (giftError || !gift) {
      return NextResponse.json(
        { success: false, error: 'Regalo no encontrado' },
        { status: 404 }
      );
    }

    const remainingAmount = gift.total_amount - gift.collected_amount;
    
    if (amount > remainingAmount) {
      // Convertir remaining a la moneda de visualización para el error
      const displayRemaining = country === 'MX' ? usdToMxn(remainingAmount) : remainingAmount;
      const currencyLabel = country === 'MX' ? 'MXN' : 'USD';
      return NextResponse.json(
        { success: false, error: `El monto excede el saldo disponible: $${displayRemaining.toFixed(2)} ${currencyLabel}` },
        { status: 400 }
      );
    }

    // 2. Convertir archivo a buffer
    const arrayBuffer = await receiptFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Subir comprobante a Supabase Storage
    const fileExt = receiptFile.name.split('.').pop() || 'jpg';
    const fileName = `${giftId}_${Date.now()}.${fileExt}`;
    const filePath = `receipts/${country}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('wedding-assets')
      .upload(filePath, buffer, {
        contentType: receiptFile.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading receipt:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Error al subir el comprobante' },
        { status: 500 }
      );
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('wedding-assets')
      .getPublicUrl(filePath);

    // 4. Crear registro inicial de transacción
    const { data: transaction, error: transactionError } = await supabase
      .from('gift_transactions')
      .insert({
        gift_id: giftId,
        donor_name: donorName.trim(),
        message: message?.trim() || null,
        amount,
        payment_method: country === 'EC' ? ('transfer_ec' as const) : ('transfer_mx' as const),
        country,
        receipt_url: publicUrl,
        receipt_filename: fileName,
        status: 'PROCESSING' as const
      } as any)
      .select()
      .single<GiftTransaction>();

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      return NextResponse.json(
        { success: false, error: 'Error al crear la transacción' },
        { status: 500 }
      );
    }

    // 5. Validar con Gemini API (en background, no bloquear respuesta)
    // Pasar displayAmount para que Gemini valide contra el monto en el comprobante
    validateReceiptAsync(
      transaction.id,
      buffer,
      country,
      displayAmount, // Monto en la moneda original del comprobante
      giftId,
      supabase
    ).catch(console.error);

    // 6. Respuesta inmediata al usuario
    return NextResponse.json({
      success: true,
      status: 'processing',
      message: 'Tu comprobante está siendo validado. Te notificaremos pronto.',
      transactionId: transaction.id,
      data: {
        donorName,
        amount,
        country,
        giftName: gift.name
      }
    });

  } catch (error) {
    console.error('Error processing transfer:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la transferencia' },
      { status: 500 }
    );
  }
}

/**
 * Valida el comprobante con Gemini de forma asíncrona
 */
async function validateReceiptAsync(
  transactionId: string,
  imageBuffer: Buffer,
  country: 'EC' | 'MX',
  expectedAmount: number,
  giftId: string,
  supabase: any
) {
  try {
    const validator = new GeminiReceiptValidator();
    
    const result = await validator.validateReceipt(
      imageBuffer,
      country,
      expectedAmount,
      transactionId
    );

    const needsReview = validator.needsManualReview(result.validation);

    let validationStatus: 'APPROVED' | 'MANUAL_REVIEW' | 'REJECTED';
    
    if (needsReview) {
      validationStatus = 'MANUAL_REVIEW';
    } else if (result.validation.isValid) {
      validationStatus = 'APPROVED';
      // Nota: El trigger trigger_update_gift_collected_amount se encargará
      // automáticamente de actualizar gifts.collected_amount cuando
      // el status cambie a APPROVED
    } else {
      validationStatus = 'REJECTED';
    }

    // Actualizar transacción con resultados de validación
    // El trigger se activará automáticamente si status = 'APPROVED'
    await supabase
      .from('gift_transactions')
      .update({
        status: validationStatus,
        extracted_recipient_name: result.extractedData.recipientName,
        extracted_account: result.extractedData.recipientAccount,
        extracted_amount: result.extractedData.amount,
        extracted_currency: result.extractedData.currency,
        extracted_date: result.extractedData.transactionDate,
        extracted_reference: result.extractedData.referenceNumber,
        extracted_bank: result.extractedData.bankName,
        validation_confidence: result.validation.confidence,
        validation_errors: result.validation.errors || [],
        validated_at: new Date().toISOString(),
        approved_at: validationStatus === 'APPROVED' ? new Date().toISOString() : null
      })
      .eq('id', transactionId);

    console.log(`Validation completed for transaction ${transactionId}: ${validationStatus}`);

    // TODO: Enviar notificación al usuario (email/SMS)
    // TODO: Si es manual_review, notificar a admin

  } catch (error) {
    console.error('Error in async validation:', error);
    
    // Marcar como error de procesamiento
    await supabase
      .from('gift_transactions')
      .update({
        status: 'MANUAL_REVIEW',
        validation_errors: ['Error al procesar con Gemini AI']
      })
      .eq('id', transactionId);
  }
}

/**
 * GET /api/gifts/transfer?transactionId=xxx
 * Consulta el estado de validación de una transferencia
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'transactionId requerido' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: transaction, error } = await supabase
      .from('gift_transactions')
      .select(`
        id,
        donor_name,
        amount,
        payment_method,
        country,
        status,
        validation_confidence,
        validation_errors,
        extracted_recipient_name,
        extracted_amount,
        validated_at,
        created_at,
        gifts (
          id,
          name
        )
      `)
      .eq('id', transactionId)
      .single();

    if (error || !transaction) {
      return NextResponse.json(
        { success: false, error: 'Transacción no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Error al consultar la transacción' },
      { status: 500 }
    );
  }
}
