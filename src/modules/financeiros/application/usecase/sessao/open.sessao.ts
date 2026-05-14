import { SessaoCaixaRepository } from "../../repository/sessao.caixa.repository";
import { SessaoCaixa } from "../../../domain/entity/sessao";
import { AppErro, TipoAppErro } from "@/shared/errors/app.error";

export interface AbrirSessaoCaixaInput {
    funcionarioId: string,
    empresaId: string,
    valorInicial: number,
}

export interface AbrirSessaoCaixaOutput {
    id: string
}

export class AbrirSessao {
    constructor(
        private readonly sessaoCaixaRepository: SessaoCaixaRepository,
    ){}

    public async run(input: AbrirSessaoCaixaInput): Promise<AbrirSessaoCaixaOutput> {
        const sessaoAberta = await this.sessaoCaixaRepository.buscarAbertaPorFuncionarioId(input.funcionarioId)
        if (sessaoAberta) {
            throw new AppErro("você já possui uma sessão de caixa aberta", TipoAppErro.ENTRADA_INVALIDA)
        }
        const sessao = SessaoCaixa.abrir(
            input.funcionarioId,
            input.empresaId,
            input.valorInicial,
        )
        const id = await this.sessaoCaixaRepository.salvar(sessao)
        return {
            id: id,
        }
    }
}