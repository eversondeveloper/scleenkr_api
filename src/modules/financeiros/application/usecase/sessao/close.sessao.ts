import { SessaoCaixaRepository } from "../../repository/sessao.caixa.repository"
import { AppErro, TipoAppErro } from "@/shared/errors/app.error";

export interface FecharSessaoInput {
    funcionarioId: string
    valorFinal: number
}

export interface FecharSessaoOutput {
    id: string,
    valorEspeado: number
}

export class FecharSessao {
    constructor(private readonly sessaoCaixaRepository: SessaoCaixaRepository){}

    public async run(input: FecharSessaoInput): Promise<FecharSessaoOutput> {
        const sessaoAberta = await this.sessaoCaixaRepository.buscarAbertaPorFuncionarioId(input.funcionarioId)
        if (!sessaoAberta) {
            throw new AppErro("você não possui uma sessão de caixa aberta", TipoAppErro.ENTRADA_INVALIDA)
        }
        const valorEsperado = sessaoAberta.fechar(input.valorFinal)
        return {
            id: sessaoAberta.buscarPropriedades().id,
            valorEspeado: valorEsperado,
        }
    }
}
