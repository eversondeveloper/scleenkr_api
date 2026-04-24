-- Fase 5: adiciona autenticação aos atendentes
ALTER TABLE atendentes
    ADD COLUMN IF NOT EXISTS senha_hash VARCHAR(255);

-- Após rodar este script, defina as senhas iniciais via:
-- UPDATE atendentes SET senha_hash = crypt('senhaInicial', gen_salt('bf')) WHERE id_atendente = X;
-- Ou use o endpoint PATCH /atendentes/:id/senha (autenticado).
