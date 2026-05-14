import { SessaoCaixaRepository } from "../../application/repository/sessao.caixa.repository";
import { SessaoCaixa } from "../../domain/entity/sessao";

export class InMemorySessaoCaixaRepository implements SessaoCaixaRepository{
    private sessoes = new Map<string, SessaoCaixa>()

    public async salvar(sessao: SessaoCaixa): Promise<string> {
        const funcionarioId = sessao.buscarPropriedades().funcionarioId
        this.sessoes.set(funcionarioId, sessao)
        return funcionarioId
    }

    public async buscarAbertaPorFuncionarioId(funcionarioId: string): Promise<SessaoCaixa | null> {
        return this.sessoes.get(funcionarioId) || null
    }
}