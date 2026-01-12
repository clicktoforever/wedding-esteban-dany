-- ============================================
-- AGREGAR POLÍTICAS DE INSERT, UPDATE Y DELETE PARA ADMIN
-- ============================================

-- 1. GUESTS: Permitir inserción pública (para el panel de admin)
CREATE POLICY "Public insert guests"
    ON guests FOR INSERT
    WITH CHECK (true);

-- 2. GUESTS: Permitir actualización pública (para editar invitados)
CREATE POLICY "Public update guests"
    ON guests FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 3. GUESTS: Permitir eliminación pública (para eliminar invitados)
CREATE POLICY "Public delete guests"
    ON guests FOR DELETE
    USING (true);

-- 4. PASSES: Permitir inserción pública (para el panel de admin)
CREATE POLICY "Public insert passes"
    ON passes FOR INSERT
    WITH CHECK (true);

-- 5. PASSES: Permitir eliminación pública (para eliminar pases)
CREATE POLICY "Public delete passes"
    ON passes FOR DELETE
    USING (true);
