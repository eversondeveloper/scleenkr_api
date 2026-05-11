import { FuncionarioCache } from "../cache/cache";
import { SMTPServer } from "@/modules/funcionarios/application/smtp/smtp"
import { FuncionarioRepository } from "../repository/repository";
import { AppErro, TipoAppErro } from "@/shared/errors/app.error";

export interface RegistrarFuncionarioInput {
    funcionarioID: string,
    email: string,
    cpf: string,
    cargo: string,
}

export class RegistrarFuncionario {
    constructor(
        private readonly funcionarioCache: FuncionarioCache,
        private readonly smtpServer: SMTPServer,
        private readonly funcionarioRepository: FuncionarioRepository
    ) {}

    public async run(input: RegistrarFuncionarioInput): Promise<void> {
        const funcionario = await this.funcionarioRepository.buscarPorID(input.funcionarioID)

        if (!funcionario.temCapacidadeDeGestao()) {
            throw new AppErro("Funcionário não tem capacidade de gestão", TipoAppErro.ENTRADA_INVALIDA)
        }

        const funcionarioTemporario = funcionario.criarIntencaoDeNovoFuncionario(input.email, input.cpf, input.cargo)
        const dados = funcionario.buscarPropriedades()

        await this.funcionarioCache.set({
            email: funcionarioTemporario.email,
            cpf: funcionarioTemporario.cpf,
            cargo: funcionarioTemporario.cargo,
            empresaID: dados.empresaId,
            atividade: false,
        })
        
        await this.smtpServer.enviar({
            email: funcionarioTemporario.email,
            cargo: funcionarioTemporario.cargo,
            link: "http://localhost:8080/funcionario/confirmar"
        })
    }
}



