import { Funcionario } from "../../domain/entity/funcionario";
import { FuncionarioCache } from "../cache/cache";
import { FuncionarioRepository } from "../repository/repository";
import { AppErro, TipoAppErro } from "@/shared/errors/app.error";

export interface CriarFuncionarioInput {
    nome: string;
    telefone: string;
    cpf: string
}

export interface CriarFuncionarioOutput {
    id: string;
    nome: string;
    telefone: string;
    ativo: boolean;
    cargo: string;
    criadoEm: Date;
    atualizadoEm: Date;
}

export class CriarFuncionario {
    constructor(
        private funcionarioCache: FuncionarioCache,
        private funcionarioRepository: FuncionarioRepository
    ) {}

    public async run(input: CriarFuncionarioInput): Promise<CriarFuncionarioOutput> {
        const dadosFuncionario = await this.funcionarioCache.get(input.cpf) 
        if (dadosFuncionario === null) {
            throw new AppErro("convite expirado ou inválido", TipoAppErro.OPERACAO_INVALIDA)
        }
        const funcionario = Funcionario.criar(
            dadosFuncionario.empresaID,
            input.nome,
            dadosFuncionario.email,
            input.telefone,
            dadosFuncionario.cpf,
            true,
            dadosFuncionario.cargo,
        )
        const id = await this.funcionarioRepository.criar(funcionario)
        const output = funcionario.buscarPropriedades()
        return {
            id: output.id,
            nome: output.nome,
            telefone: output.telefone,
            ativo: output.ativo,
            cargo: output.cargo,
            criadoEm: output.criadoEm,
            atualizadoEm: output.atualizadoEm,
        }
    }
}
