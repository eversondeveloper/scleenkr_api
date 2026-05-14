import { SessaoCaixa } from "../../domain/entity/sessao";

export interface SessaoCaixaRepository {
    salvar(sessao: SessaoCaixa): Promise<string>
    buscarAbertaPorFuncionarioId(funcionarioId: string): Promise<SessaoCaixa | null>
}