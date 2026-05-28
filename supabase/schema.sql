-- =============================================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS — BODA CARLOS & DANY
-- =============================================================================
-- Proyecto: wedding-esteban-dany | Plataforma: Supabase (PostgreSQL)
-- Fecha: Mayo 2026
--
-- INSTRUCCIONES PARA LEVANTAR DESDE CERO:
--   1. Crear proyecto nuevo en supabase.com
--   2. SQL Editor → ejecutar este archivo completo
--   3. Authentication → Hooks → crear trigger handle_new_user (ver abajo)
--   4. Edge Functions → deploy confirm-payphone-payment
--   5. Configurar variables de entorno según docs/DOCUMENTATION.md
-- =============================================================================


-- =============================================================================
-- EXTENSIONES
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "pg_net"    WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"  WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";


-- =============================================================================
-- TIPOS ENUMERADOS
-- =============================================================================
CREATE TYPE public.confirmation_status AS ENUM ('pending','confirmed','declined');

CREATE TYPE public.transaction_status AS ENUM (
    'PENDING','APPROVED','REJECTED','PROCESSING','MANUAL_REVIEW'
);

CREATE TYPE public.wallet_transaction_type AS ENUM (
    'GIFT_REWARD','STORE_PURCHASE','BONUS','ADMIN_ADJUSTMENT'
);

CREATE TYPE public.purchase_status AS ENUM ('ACTIVE','REDEEMED','EXPIRED');


-- =============================================================================
-- TABLAS
-- =============================================================================

-- admin_users: Usuarios con acceso al panel admin. Requiere cuenta en auth.users.
CREATE TABLE public.admin_users (
    id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id    uuid NOT NULL UNIQUE REFERENCES auth.users(id),
    email      text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT timezone('utc',now()) NOT NULL
);

-- configurations: Key-value store para configuraciones dinámicas.
-- Claves: wedding_date, confirmation_deadline, deuna_payment_link
CREATE TABLE public.configurations (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key         text NOT NULL UNIQUE,
    value       text,
    description text,
    created_at  timestamptz DEFAULT now(),
    updated_at  timestamptz DEFAULT now()
);

-- guests: Invitados (grupos/familias). access_token = link único por WhatsApp.
-- guest_type: 'full' (boda+fiesta) | 'party' (solo fiesta)
CREATE TABLE public.guests (
    id                uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
    name              text    NOT NULL,
    email             text,
    phone             text,
    access_token      text    NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(16),'hex'),
    created_at        timestamptz DEFAULT now() NOT NULL,
    updated_at        timestamptz DEFAULT now() NOT NULL,
    notified_whatsapp boolean DEFAULT false NOT NULL,
    guest_type        text    DEFAULT 'full' CHECK (guest_type IN ('full','party'))
);

-- tables: Mesas del evento (capacidad máx 12 personas).
CREATE TABLE public.tables (
    id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name       text NOT NULL,
    capacity   integer NOT NULL CHECK (capacity > 0 AND capacity <= 12),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- passes: Pases individuales por asistente. N passes por guest.
CREATE TABLE public.passes (
    id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    guest_id            uuid NOT NULL REFERENCES public.guests(id),
    attendee_name       text NOT NULL,
    confirmation_status public.confirmation_status DEFAULT 'pending' NOT NULL,
    updated_at          timestamptz DEFAULT now() NOT NULL,
    table_id            uuid REFERENCES public.tables(id)
);

-- gifts: Regalos de la mesa. Soportan crowdfunding parcial.
-- status: AVAILABLE | COMPLETED (cuando collected_amount >= total_amount)
CREATE TABLE public.gifts (
    id                uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
    name              text    NOT NULL,
    description       text,
    image_url         text,
    price             numeric,
    category          text,
    total_amount      numeric DEFAULT 0,
    collected_amount  numeric DEFAULT 0,
    status            text    DEFAULT 'AVAILABLE' CHECK (status = ANY(ARRAY['AVAILABLE','COMPLETED'])),
    is_crowdfunding   boolean DEFAULT false,
    contributor_count integer DEFAULT 0,
    created_at        timestamptz DEFAULT now() NOT NULL,
    updated_at        timestamptz DEFAULT now() NOT NULL
);

-- gift_transactions: Contribuciones/pagos a regalos.
-- payment_method: payphone | transfer_ec | transfer_mx
-- Los campos extracted_* son llenados por Gemini AI al validar comprobantes.
CREATE TABLE public.gift_transactions (
    id                             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    gift_id                        uuid NOT NULL REFERENCES public.gifts(id),
    donor_name                     text NOT NULL,
    donor_email                    text NOT NULL,
    amount                         numeric NOT NULL CHECK (amount > 0),
    status                         public.transaction_status DEFAULT 'PENDING' NOT NULL,
    payment_method                 text DEFAULT 'payphone'
        CHECK (payment_method = ANY(ARRAY['payphone','transfer_ec','transfer_mx'])),
    country                        text CHECK ((country = ANY(ARRAY['EC','MX'])) OR country IS NULL),
    payphone_client_transaction_id text UNIQUE,
    payphone_transaction_id        text,
    receipt_url                    text,
    receipt_filename               text,
    extracted_recipient_name       text,
    extracted_account              text,
    extracted_amount               numeric,
    extracted_currency             text,
    extracted_date                 date,
    extracted_reference            text,
    extracted_bank                 text,
    validation_confidence          text
        CHECK ((validation_confidence = ANY(ARRAY['high','medium','low'])) OR validation_confidence IS NULL),
    validation_errors              jsonb DEFAULT '[]',
    validated_at                   timestamptz,
    approved_at                    timestamptz,
    message                        text,
    created_at                     timestamptz DEFAULT now() NOT NULL,
    updated_at                     timestamptz DEFAULT now() NOT NULL
);

-- store_users: Wallets de Machi Coins. PK = email.
-- id puede ser NULL si el usuario aún no creó cuenta en Supabase Auth.
-- 1 USD donado = 10 Machi Coins (acuñados automáticamente por trigger).
CREATE TABLE public.store_users (
    email           text PRIMARY KEY,
    id              uuid UNIQUE REFERENCES auth.users(id),
    full_name       text,
    current_balance integer DEFAULT 0 NOT NULL CHECK (current_balance >= 0),
    created_at      timestamptz DEFAULT now() NOT NULL,
    updated_at      timestamptz DEFAULT now() NOT NULL
);

-- store_items: Premios y experiencias canjeables con Machi Coins.
-- rarity: 1=Común (peso 60) ... 5=Legendario (peso 1) para el gacha.
-- category: EXPERIENCE | RAFFLE | PROP
CREATE TABLE public.store_items (
    id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title         text NOT NULL,
    description   text,
    image_url     text,
    price_coins   integer NOT NULL CHECK (price_coins > 0),
    stock_limit   integer CHECK (stock_limit IS NULL OR stock_limit >= 0),
    is_active     boolean DEFAULT true NOT NULL,
    category      text DEFAULT 'EXPERIENCE' NOT NULL,
    display_order integer DEFAULT 0,
    rarity        integer DEFAULT 1 CHECK (rarity >= 1 AND rarity <= 5),
    created_at    timestamptz DEFAULT now() NOT NULL,
    updated_at    timestamptz DEFAULT now() NOT NULL
);

-- wallet_transactions: Historial de Machi Coins (entradas y salidas).
-- amount positivo = ingreso, negativo = gasto.
CREATE TABLE public.wallet_transactions (
    id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id          uuid,
    user_email       text NOT NULL,
    amount           integer NOT NULL,
    transaction_type public.wallet_transaction_type NOT NULL,
    source_gift_id   uuid REFERENCES public.gift_transactions(id),
    description      text,
    metadata         jsonb,
    created_at       timestamptz DEFAULT now() NOT NULL
);

-- purchased_items: Compras con QR único para canjear en la fiesta.
CREATE TABLE public.purchased_items (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     uuid NOT NULL,
    item_id     uuid NOT NULL REFERENCES public.store_items(id),
    qr_code     text NOT NULL UNIQUE,
    status      public.purchase_status DEFAULT 'ACTIVE' NOT NULL,
    redeemed_at timestamptz,
    redeemed_by text,
    notes       text,
    created_at  timestamptz DEFAULT now() NOT NULL
);

-- guest_photos: Fotos subidas en la fiesta (Paparazzi).
-- Cada foto otorga 5 coins (máx 10 fotos con recompensa/día).
CREATE TABLE public.guest_photos (
    id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    guest_id   uuid NOT NULL REFERENCES public.store_users(id),
    image_url  text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);


-- =============================================================================
-- VISTAS
-- =============================================================================

-- gift_progress: Progreso de crowdfunding por regalo activo.
CREATE OR REPLACE VIEW public.gift_progress AS
SELECT
    g.id, g.name, g.total_amount, g.collected_amount, g.status, g.is_crowdfunding,
    (g.total_amount - g.collected_amount) AS remaining_amount,
    CASE WHEN g.total_amount > 0
        THEN round((g.collected_amount / g.total_amount) * 100, 2)
        ELSE 0 END AS progress_percentage,
    count(gt.id) AS total_contributions,
    count(CASE WHEN gt.status = 'APPROVED'::transaction_status THEN 1 ELSE NULL END) AS approved_contributions
FROM gifts g
LEFT JOIN gift_transactions gt ON g.id = gt.gift_id
WHERE g.is_crowdfunding = true
GROUP BY g.id, g.name, g.total_amount, g.collected_amount, g.status, g.is_crowdfunding;


-- =============================================================================
-- FUNCIONES
-- =============================================================================

-- update_updated_at_column: Trigger genérico para mantener updated_at.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.update_configurations_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.update_tables_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

-- is_admin: Verifica si el usuario actual es admin.
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid DEFAULT NULL::uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE target_user_id UUID;
BEGIN
  target_user_id := COALESCE(check_user_id, auth.uid());
  RETURN EXISTS (SELECT 1 FROM admin_users WHERE user_id = target_user_id);
END; $$;

CREATE OR REPLACE FUNCTION public.is_admin(user_email text)
RETURNS boolean LANGUAGE plpgsql AS $$
BEGIN RETURN EXISTS (SELECT 1 FROM admin_users WHERE email = user_email); END; $$;

-- is_gift_completed: Verifica si un regalo alcanzó su meta.
CREATE OR REPLACE FUNCTION public.is_gift_completed(gift gifts)
RETURNS boolean LANGUAGE plpgsql AS $$
BEGIN RETURN gift.collected_amount >= gift.total_amount AND gift.is_crowdfunding = true; END; $$;

-- get_wedding_stats: Estadísticas para el dashboard admin.
CREATE OR REPLACE FUNCTION public.get_wedding_stats()
RETURNS TABLE(
    total_guests integer, total_passes integer, confirmed_passes integer,
    declined_passes integer, pending_passes integer, total_gifts integer,
    completed_gifts integer, total_contributions integer, approved_contributions integer
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY SELECT
        (SELECT COUNT(DISTINCT g.id) FROM guests g)::INT,
        (SELECT COUNT(*) FROM passes)::INT,
        (SELECT COUNT(*) FROM passes WHERE confirmation_status = 'confirmed')::INT,
        (SELECT COUNT(*) FROM passes WHERE confirmation_status = 'declined')::INT,
        (SELECT COUNT(*) FROM passes WHERE confirmation_status = 'pending')::INT,
        (SELECT COUNT(*) FROM gifts)::INT,
        (SELECT COUNT(*) FROM gifts WHERE status = 'COMPLETED')::INT,
        (SELECT COUNT(*) FROM gift_transactions)::INT,
        (SELECT COUNT(*) FROM gift_transactions WHERE status = 'APPROVED')::INT;
END; $$;

-- approve_gift_transaction: Aprueba una transacción con bloqueo de fila.
-- Llamada por la Edge Function confirm-payphone-payment.
CREATE OR REPLACE FUNCTION public.approve_gift_transaction(transaction_id uuid)
RETURNS json LANGUAGE plpgsql AS $$
DECLARE
    v_transaction gift_transactions%ROWTYPE;
    v_gift        gifts%ROWTYPE;
    v_new_collected NUMERIC(10,2);
BEGIN
    SELECT * INTO v_transaction FROM gift_transactions WHERE id = transaction_id FOR UPDATE;
    IF NOT FOUND THEN RETURN json_build_object('success',false,'error','Transaction not found'); END IF;
    IF v_transaction.status = 'APPROVED' THEN RETURN json_build_object('success',false,'error','Transaction already approved'); END IF;

    SELECT * INTO v_gift FROM gifts WHERE id = v_transaction.gift_id FOR UPDATE;
    IF NOT FOUND THEN RETURN json_build_object('success',false,'error','Gift not found'); END IF;

    v_new_collected := v_gift.collected_amount + v_transaction.amount;
    IF v_new_collected > v_gift.total_amount THEN
        RETURN json_build_object('success',false,'error','Amount exceeds remaining balance',
            'remaining', v_gift.total_amount - v_gift.collected_amount);
    END IF;

    UPDATE gift_transactions SET status='APPROVED', approved_at=NOW(), updated_at=NOW() WHERE id=transaction_id;
    UPDATE gifts SET
        collected_amount = v_new_collected,
        status = CASE WHEN v_new_collected >= total_amount THEN 'COMPLETED' ELSE 'AVAILABLE' END,
        updated_at = NOW()
    WHERE id = v_transaction.gift_id;

    RETURN json_build_object('success',true,'transaction_id',transaction_id,
        'gift_id',v_transaction.gift_id,'new_collected_amount',v_new_collected,
        'total_amount',v_gift.total_amount,'is_completed',v_new_collected >= v_gift.total_amount);
END; $$;

-- update_gift_collected_amount: Trigger — recalcula collected_amount del regalo.
CREATE OR REPLACE FUNCTION public.update_gift_collected_amount()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
    v_new_collected NUMERIC(10,2);
    v_gift          RECORD;
    v_gift_id       UUID;
BEGIN
    v_gift_id := CASE WHEN TG_OP='DELETE' THEN OLD.gift_id ELSE NEW.gift_id END;
    SELECT COALESCE(SUM(amount),0) INTO v_new_collected FROM gift_transactions
        WHERE gift_id=v_gift_id AND status='APPROVED';
    SELECT * INTO v_gift FROM gifts WHERE id=v_gift_id FOR UPDATE;
    IF FOUND THEN
        UPDATE gifts SET
            collected_amount = v_new_collected,
            status = CASE WHEN v_new_collected >= total_amount THEN 'COMPLETED' ELSE 'AVAILABLE' END,
            is_crowdfunding = true, updated_at = NOW()
        WHERE id = v_gift_id;
    END IF;
    RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
END; $$;

-- update_gift_contributor_count: Trigger — cuenta donantes únicos.
CREATE OR REPLACE FUNCTION public.update_gift_contributor_count()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE gifts SET
        contributor_count = (SELECT COUNT(DISTINCT donor_name) FROM gift_transactions
            WHERE gift_id=NEW.gift_id AND status='APPROVED'),
        updated_at = NOW()
    WHERE id = NEW.gift_id;
    RETURN NEW;
END; $$;

-- mint_coins_from_gift: Trigger — acuña Machi Coins al aprobar una transacción.
-- Tasa: 1 USD = 10 Machi Coins. Hace UPSERT en store_users.
CREATE OR REPLACE FUNCTION public.mint_coins_from_gift()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
    v_coins         INTEGER;
    v_user_email    TEXT;
    v_existing_user RECORD;
BEGIN
    IF NEW.status='APPROVED' AND (OLD.status IS NULL OR OLD.status!='APPROVED') THEN
        v_coins := FLOOR(NEW.amount * 10);
        v_user_email := NEW.donor_email;
        IF v_coins > 0 THEN
            SELECT * INTO v_existing_user FROM public.store_users WHERE email=v_user_email;
            IF v_existing_user IS NULL THEN
                INSERT INTO public.store_users (email,full_name,current_balance)
                VALUES (v_user_email, NEW.donor_name, v_coins);
            ELSE
                UPDATE public.store_users SET current_balance=current_balance+v_coins, updated_at=NOW()
                WHERE email=v_user_email;
            END IF;
            INSERT INTO public.wallet_transactions (user_id,user_email,amount,transaction_type,source_gift_id,description)
            VALUES (
                (SELECT id FROM public.store_users WHERE email=v_user_email),
                v_user_email, v_coins, 'GIFT_REWARD', NEW.id,
                format('Regalo: %s - $%s USD = %s Machi Coins',
                    (SELECT name FROM public.gifts WHERE id=NEW.gift_id), NEW.amount::text, v_coins::text)
            );
        END IF;
    END IF;
    RETURN NEW;
END; $$;

-- trigger_confirm_payphone_payment: Trigger — invoca Edge Function via pg_net.
-- REEMPLAZAR [PROJECT_REF] y [SERVICE_ROLE_KEY] con valores reales.
CREATE OR REPLACE FUNCTION public.trigger_confirm_payphone_payment()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
    edge_function_url TEXT;
    payload           JSONB;
    request_id        BIGINT;
    service_role_key  TEXT;
BEGIN
    IF NEW.status='PENDING'
       AND NEW.payphone_transaction_id IS NOT NULL
       AND (OLD.payphone_transaction_id IS NULL OR OLD.payphone_transaction_id<>NEW.payphone_transaction_id)
    THEN
        -- REEMPLAZAR con la referencia real del proyecto Supabase
        edge_function_url := 'https://[PROJECT_REF].supabase.co/functions/v1/confirm-payphone-payment';
        -- REEMPLAZAR con el service_role key (Settings → API → service_role)
        service_role_key := '[SERVICE_ROLE_KEY]';
        payload := jsonb_build_object('record', jsonb_build_object(
            'id',NEW.id,'gift_id',NEW.gift_id,'donor_name',NEW.donor_name,'amount',NEW.amount,
            'status',NEW.status,'payphone_transaction_id',NEW.payphone_transaction_id,
            'payphone_client_transaction_id',NEW.payphone_client_transaction_id
        ));
        SELECT INTO request_id net.http_post(
            url := edge_function_url,
            headers := jsonb_build_object('Content-Type','application/json',
                'Authorization','Bearer ' || service_role_key),
            body := payload
        );
        RAISE LOG 'Triggered PayPhone confirmation for transaction % request_id %', NEW.id, request_id;
    END IF;
    RETURN NEW;
END; $$;

-- handle_new_user: Trigger en auth.users — crea store_users y linkea wallets.
-- NOTA: Crear este trigger desde Supabase Dashboard → Authentication → Hooks.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_full_name TEXT;
BEGIN
    SELECT donor_name INTO v_full_name FROM public.gift_transactions
    WHERE lower(donor_email)=lower(NEW.email) ORDER BY created_at DESC LIMIT 1;
    IF v_full_name IS NULL THEN v_full_name := 'Invitado'; END IF;
    INSERT INTO public.store_users (id,email,full_name,updated_at)
    VALUES (NEW.id, NEW.email, v_full_name, NOW())
    ON CONFLICT (email) DO UPDATE SET id=NEW.id, updated_at=NOW();
    UPDATE public.wallet_transactions SET user_id=NEW.id
    WHERE lower(user_email)=lower(NEW.email) AND user_id IS NULL;
    RETURN NEW;
END; $$;

-- delete_gift_transaction: Elimina transacción y revierte Machi Coins del wallet.
CREATE OR REPLACE FUNCTION public.delete_gift_transaction(p_transaction_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_tx RECORD; v_wallet_tx RECORD;
BEGIN
    SELECT * INTO v_tx FROM public.gift_transactions WHERE id=p_transaction_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Transaction no encontrada.'; END IF;
    FOR v_wallet_tx IN SELECT user_email,amount FROM public.wallet_transactions WHERE source_gift_id=p_transaction_id
    LOOP
        UPDATE public.store_users SET current_balance=GREATEST(0,current_balance-v_wallet_tx.amount), updated_at=NOW()
        WHERE email=v_wallet_tx.user_email;
    END LOOP;
    DELETE FROM public.wallet_transactions WHERE source_gift_id=p_transaction_id;
    DELETE FROM public.gift_transactions WHERE id=p_transaction_id;
END; $$;

-- purchase_store_item: Compra item con bloqueo pesimista (FOR UPDATE).
CREATE OR REPLACE FUNCTION public.purchase_store_item(p_item_id uuid, p_user_id uuid)
RETURNS json LANGUAGE plpgsql AS $$
DECLARE
    v_item         RECORD;
    v_user_balance INTEGER;
    v_qr_code      TEXT;
    v_purchase_id  UUID;
BEGIN
    SELECT * INTO v_item FROM public.store_items WHERE id=p_item_id FOR UPDATE;
    IF v_item IS NULL THEN RETURN json_build_object('success',false,'error','ITEM_NOT_FOUND'); END IF;
    IF NOT v_item.is_active THEN RETURN json_build_object('success',false,'error','ITEM_INACTIVE'); END IF;
    IF v_item.stock_limit IS NOT NULL AND v_item.stock_limit<=0 THEN RETURN json_build_object('success',false,'error','OUT_OF_STOCK'); END IF;
    SELECT current_balance INTO v_user_balance FROM public.store_users WHERE id=p_user_id FOR UPDATE;
    IF v_user_balance < v_item.price_coins THEN
        RETURN json_build_object('success',false,'error','INSUFFICIENT_BALANCE',
            'message',format('Te faltan %s Machi Coins.',v_item.price_coins-v_user_balance));
    END IF;
    v_qr_code := encode(gen_random_bytes(16),'hex');
    UPDATE public.store_users SET current_balance=current_balance-v_item.price_coins, updated_at=NOW() WHERE id=p_user_id;
    IF v_item.stock_limit IS NOT NULL THEN
        UPDATE public.store_items SET stock_limit=stock_limit-1, updated_at=NOW() WHERE id=p_item_id;
    END IF;
    INSERT INTO public.purchased_items (user_id,item_id,qr_code) VALUES (p_user_id,p_item_id,v_qr_code) RETURNING id INTO v_purchase_id;
    INSERT INTO public.wallet_transactions (user_id,user_email,amount,transaction_type,description,metadata)
    VALUES (p_user_id,(SELECT email FROM public.store_users WHERE id=p_user_id),
        -v_item.price_coins,'STORE_PURCHASE',format('Compra: %s',v_item.title),
        json_build_object('purchase_id',v_purchase_id,'item_id',p_item_id));
    RETURN json_build_object('success',true,'purchase_id',v_purchase_id,'qr_code',v_qr_code,'new_balance',v_user_balance-v_item.price_coins);
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success',false,'error','TRANSACTION_FAILED','message',format('Error: %s',SQLERRM));
END; $$;

-- play_gacha: Ruleta ponderada por rareza. Costo: 75 coins.
-- Pesos: rarity 1=60, 2=30, 3=15, 4=5, 5=1
CREATE OR REPLACE FUNCTION public.play_gacha(p_user_id uuid)
RETURNS json LANGUAGE plpgsql AS $$
DECLARE
    v_cost              CONSTANT INTEGER := 75;
    v_user_balance      INTEGER;
    v_item              RECORD;
    v_total_weight      INTEGER;
    v_random_weight     INTEGER;
    v_cummulative_weight INTEGER;
    v_selected_item_id  UUID;
    v_item_details      RECORD;
    v_qr_code           TEXT;
    v_purchase_id       UUID;
BEGIN
    SELECT current_balance INTO v_user_balance FROM public.store_users WHERE id=p_user_id FOR UPDATE;
    IF v_user_balance IS NULL THEN RETURN json_build_object('success',false,'error','USER_NOT_FOUND'); END IF;
    IF v_user_balance < v_cost THEN RETURN json_build_object('success',false,'error','INSUFFICIENT_BALANCE','message','Costo: 75 Machi Coins.'); END IF;

    CREATE TEMPORARY TABLE temp_gacha_weights AS
    SELECT id, CASE rarity WHEN 1 THEN 60 WHEN 2 THEN 30 WHEN 3 THEN 15 WHEN 4 THEN 5 WHEN 5 THEN 1 ELSE 10 END AS weight
    FROM store_items WHERE is_active=TRUE AND (stock_limit IS NULL OR stock_limit>0);

    SELECT SUM(weight) INTO v_total_weight FROM temp_gacha_weights;
    IF v_total_weight IS NULL OR v_total_weight=0 THEN DROP TABLE temp_gacha_weights;
        RETURN json_build_object('success',false,'error','NO_ITEMS_AVAILABLE'); END IF;

    v_random_weight := floor(random()*v_total_weight)+1;
    v_cummulative_weight := 0; v_selected_item_id := NULL;
    FOR v_item IN SELECT id,weight FROM temp_gacha_weights LOOP
        v_cummulative_weight := v_cummulative_weight + v_item.weight;
        IF v_random_weight <= v_cummulative_weight THEN v_selected_item_id := v_item.id; EXIT; END IF;
    END LOOP;
    DROP TABLE temp_gacha_weights;
    IF v_selected_item_id IS NULL THEN RETURN json_build_object('success',false,'error','SELECTION_ERROR'); END IF;

    SELECT * INTO v_item_details FROM store_items WHERE id=v_selected_item_id;
    v_qr_code := encode(gen_random_bytes(16),'hex');
    UPDATE public.store_users SET current_balance=current_balance-v_cost, updated_at=NOW() WHERE id=p_user_id;
    IF v_item_details.stock_limit IS NOT NULL THEN
        UPDATE public.store_items SET stock_limit=stock_limit-1, updated_at=NOW() WHERE id=v_selected_item_id;
    END IF;
    INSERT INTO public.purchased_items (user_id,item_id,qr_code) VALUES (p_user_id,v_selected_item_id,v_qr_code) RETURNING id INTO v_purchase_id;
    INSERT INTO public.wallet_transactions (user_id,user_email,amount,transaction_type,description,metadata)
    VALUES (p_user_id,(SELECT email FROM public.store_users WHERE id=p_user_id),
        -v_cost,'STORE_PURCHASE',format('Suerte: %s',v_item_details.title),
        json_build_object('purchase_id',v_purchase_id,'item_id',v_selected_item_id,'is_gacha',true));
    RETURN json_build_object('success',true,'item',json_build_object('title',v_item_details.title,
        'image_url',v_item_details.image_url,'rarity',v_item_details.rarity,'description',v_item_details.description),
        'new_balance',v_user_balance-v_cost);
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success',false,'error','TRANSACTION_FAILED','message',format('Error: %s',SQLERRM));
END; $$;

-- redeem_qr_code: Canjea un premio en la fiesta. Marca REDEEMED (UTC-5 Quito).
CREATE OR REPLACE FUNCTION public.redeem_qr_code(p_qr_code text, p_staff_name text)
RETURNS json LANGUAGE plpgsql AS $$
DECLARE v_purchase RECORD; v_item RECORD; v_guest_name TEXT;
BEGIN
    SELECT * INTO v_purchase FROM public.purchased_items WHERE qr_code=p_qr_code FOR UPDATE;
    IF v_purchase IS NULL THEN RETURN json_build_object('success',false,'error','QR_NOT_FOUND'); END IF;
    IF v_purchase.status='REDEEMED' THEN
        RETURN json_build_object('success',false,'error','ALREADY_REDEEMED',
            'message',format('Ya fue canjeado el %s por %s',
                to_char(v_purchase.redeemed_at,'DD/MM/YYYY HH24:MI'),v_purchase.redeemed_by)); END IF;
    SELECT * INTO v_item FROM public.store_items WHERE id=v_purchase.item_id;
    SELECT full_name INTO v_guest_name FROM public.store_users WHERE id=v_purchase.user_id;
    IF v_guest_name IS NULL THEN v_guest_name := 'Invitado Desconocido'; END IF;
    UPDATE public.purchased_items SET status='REDEEMED',
        redeemed_at=(NOW()-INTERVAL '5 hours'), redeemed_by=p_staff_name WHERE id=v_purchase.id;
    RETURN json_build_object('success',true,'guest_name',v_guest_name,
        'item',json_build_object('title',v_item.title,'category',v_item.category,'description',v_item.description),
        'purchased_at',v_purchase.created_at);
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success',false,'error','REDEMPTION_FAILED','message',format('Error: %s',SQLERRM));
END; $$;

-- upload_paparazzi_photo: Sube foto y otorga 5 coins (máx 10 fotos/día con reward).
CREATE OR REPLACE FUNCTION public.upload_paparazzi_photo(p_guest_id uuid, p_image_url text)
RETURNS json LANGUAGE plpgsql AS $$
DECLARE
    v_today_photos       INTEGER;
    v_coins_reward       INTEGER := 5;
    v_max_photos_per_day INTEGER := 10;
    v_guest_email        TEXT;
BEGIN
    SELECT email INTO v_guest_email FROM public.store_users WHERE id=p_guest_id;
    IF v_guest_email IS NULL THEN RETURN json_build_object('success',false,'error','GUEST_NOT_FOUND'); END IF;
    SELECT count(*) INTO v_today_photos FROM public.guest_photos
        WHERE guest_id=p_guest_id AND date_trunc('day',created_at)=date_trunc('day',NOW());
    INSERT INTO public.guest_photos (guest_id,image_url) VALUES (p_guest_id,p_image_url);
    IF v_today_photos < v_max_photos_per_day THEN
        UPDATE public.store_users SET current_balance=current_balance+v_coins_reward, updated_at=NOW() WHERE id=p_guest_id;
        INSERT INTO public.wallet_transactions (user_id,user_email,amount,transaction_type,description)
        VALUES (p_guest_id,v_guest_email,v_coins_reward,'BONUS','Recompensa Paparazzi (Foto '||(v_today_photos+1)::text||')');
        RETURN json_build_object('success',true,'rewarded',true,'coins_earned',v_coins_reward,'message','Has ganado 5 Machi Coins.');
    ELSE
        RETURN json_build_object('success',true,'rewarded',false,'coins_earned',0,'message','Límite de monedas alcanzado hoy.');
    END IF;
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success',false,'error','RPC_FAILED','message',SQLERRM);
END; $$;


-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER trigger_update_configurations_updated_at
    BEFORE UPDATE ON public.configurations FOR EACH ROW
    EXECUTE FUNCTION public.update_configurations_updated_at();

CREATE TRIGGER tables_updated_at
    BEFORE UPDATE ON public.tables FOR EACH ROW
    EXECUTE FUNCTION public.update_tables_updated_at();

CREATE TRIGGER update_guests_updated_at
    BEFORE UPDATE ON public.guests FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_passes_updated_at
    BEFORE UPDATE ON public.passes FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gifts_updated_at
    BEFORE UPDATE ON public.gifts FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gift_transactions_updated_at
    BEFORE UPDATE ON public.gift_transactions FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Recalcular collected_amount del regalo (INSERT, UPDATE, DELETE)
CREATE TRIGGER trigger_update_gift_collected_amount
    AFTER INSERT OR UPDATE OR DELETE ON public.gift_transactions FOR EACH ROW
    EXECUTE FUNCTION public.update_gift_collected_amount();

-- Contador de contribuyentes únicos
CREATE TRIGGER trigger_update_contributor_count
    AFTER INSERT OR UPDATE ON public.gift_transactions FOR EACH ROW
    EXECUTE FUNCTION public.update_gift_contributor_count();

-- Acuñar Machi Coins al aprobarse una transacción
CREATE TRIGGER on_gift_approved
    AFTER INSERT OR UPDATE ON public.gift_transactions FOR EACH ROW
    EXECUTE FUNCTION public.mint_coins_from_gift();

-- Invocar Edge Function para confirmar PayPhone (async via pg_net)
CREATE TRIGGER on_transaction_payphone_id_update
    AFTER UPDATE ON public.gift_transactions FOR EACH ROW
    EXECUTE FUNCTION public.trigger_confirm_payphone_payment();

CREATE TRIGGER update_store_users_updated_at
    BEFORE UPDATE ON public.store_users FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_items_updated_at
    BEFORE UPDATE ON public.store_items FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- NOTA: El siguiente trigger debe crearse desde Supabase Dashboard → Authentication → Hooks
-- porque necesita permisos de superuser para actuar sobre auth.users:
-- CREATE TRIGGER on_auth_user_created
--     AFTER INSERT ON auth.users FOR EACH ROW
--     EXECUTE FUNCTION public.handle_new_user();


-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE public.guests            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configurations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchased_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_photos      ENABLE ROW LEVEL SECURITY;

-- admin_users
CREATE POLICY "Admins can view admin_users"   ON public.admin_users FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert admin_users" ON public.admin_users FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update admin_users" ON public.admin_users FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete admin_users" ON public.admin_users FOR DELETE USING (is_admin());

-- configurations: lectura pública, escritura solo admin
CREATE POLICY "Anyone can read configurations"        ON public.configurations FOR SELECT USING (true);
CREATE POLICY "Only admins can insert configurations" ON public.configurations FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));
CREATE POLICY "Only admins can update configurations" ON public.configurations FOR UPDATE
    USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

-- guests: acceso público (autenticación por token en URL, no en BD)
CREATE POLICY "Public read guests"   ON public.guests FOR SELECT USING (true);
CREATE POLICY "Public insert guests" ON public.guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update guests" ON public.guests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete guests" ON public.guests FOR DELETE USING (true);

-- passes
CREATE POLICY "Public read passes"             ON public.passes FOR SELECT USING (true);
CREATE POLICY "Public insert passes"           ON public.passes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update passes"           ON public.passes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Update own passes by guest_id"  ON public.passes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete passes"           ON public.passes FOR DELETE USING (true);

-- tables
CREATE POLICY "Enable read access for all"  ON public.tables FOR SELECT USING (true);
CREATE POLICY "Enable insert for auth"      ON public.tables FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for auth"      ON public.tables FOR UPDATE USING (true);
CREATE POLICY "Enable delete for auth"      ON public.tables FOR DELETE USING (true);

-- gifts: lectura pública, actualización por service role
CREATE POLICY "Anyone can view gifts"    ON public.gifts FOR SELECT USING (true);
CREATE POLICY "Service can update gifts" ON public.gifts FOR UPDATE USING (true);

-- gift_transactions
CREATE POLICY "Anyone can view gift transactions" ON public.gift_transactions FOR SELECT USING (true);
CREATE POLICY "Service can insert transactions"   ON public.gift_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update transactions"   ON public.gift_transactions FOR UPDATE USING (true);

-- store_users
CREATE POLICY "Anyone can check if email exists"            ON public.store_users FOR SELECT USING (true);
CREATE POLICY "Allow insert for authenticated users"         ON public.store_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile or initial link" ON public.store_users FOR UPDATE
    USING ((auth.uid()=id) OR (id IS NULL)) WITH CHECK ((auth.uid()=id) OR (id IS NULL));
CREATE POLICY "Service role can manage store_users"          ON public.store_users FOR ALL
    USING ((auth.jwt()->>'role')='service_role');

-- store_items
CREATE POLICY "Anyone can read active store items"  ON public.store_items FOR SELECT USING (is_active=true);
CREATE POLICY "Service role can manage store_items" ON public.store_items FOR ALL
    USING ((auth.jwt()->>'role')='service_role');

-- wallet_transactions
CREATE POLICY "Users can read own transactions" ON public.wallet_transactions FOR SELECT
    USING ((auth.uid()=user_id) OR ((auth.jwt()->>'email')=user_email));
CREATE POLICY "Service role can manage transactions" ON public.wallet_transactions FOR ALL
    USING ((auth.jwt()->>'role')='service_role');

-- purchased_items
CREATE POLICY "Users can read own purchases"        ON public.purchased_items FOR SELECT USING (auth.uid()=user_id);
CREATE POLICY "Service role can manage purchases"   ON public.purchased_items FOR ALL
    USING ((auth.jwt()->>'role')='service_role');

-- guest_photos
CREATE POLICY "Public read access for guest photos"   ON public.guest_photos FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload photos" ON public.guest_photos FOR INSERT
    WITH CHECK (auth.uid()=guest_id);


-- =============================================================================
-- DATOS INICIALES
-- =============================================================================

INSERT INTO public.configurations (key, value, description) VALUES
    ('wedding_date',          '2026-04-11T18:00:00', 'Fecha y hora de la boda (ISO 8601, UTC-5 Quito)'),
    ('confirmation_deadline', '2026-03-20T23:59:59', 'Fecha límite para confirmar asistencia'),
    ('deuna_payment_link',    '',                    'Link de pago DeUna para la tienda'),
    ('party_venue',           '',                    'Dirección y detalles del venue de la fiesta')
ON CONFLICT (key) DO NOTHING;


-- =============================================================================
-- EDGE FUNCTION: confirm-payphone-payment
-- =============================================================================
-- Runtime: Deno / TypeScript | Status: ACTIVE
--
-- Invocada por trigger on_transaction_payphone_id_update via pg_net (async).
--
-- Flujo:
--   1. Recibe payload con datos de la transacción desde el trigger de BD
--   2. Llama a PayPhone V2/Confirm API
--   3. Si Approved → RPC approve_gift_transaction() → trigger mint_coins_from_gift()
--   4. Si Rejected → UPDATE status = REJECTED
--   5. Background (fire-and-forget) → /api/gifts/send-approval-email
--
-- Variables de entorno en Supabase Dashboard:
--   PAYPHONE_TOKEN, SUPABASE_URL (auto), SUPABASE_SERVICE_ROLE_KEY, NEXT_APP_URL
--
-- Deploy:
--   supabase functions deploy confirm-payphone-payment
-- =============================================================================
