import { EmpresaGateway } from "../gateway/gateway";
import { EmpresaService } from "../../domain/service/create.funcionario";

export interface CriarDonoInput {
    empresaId: string;
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
}

export interface CriarDonoOutput {
    ID: string
}

export class CriarDono {
    constructor(
        private empresaGateway: EmpresaGateway,
    ){}

    public async run(input: CriarDonoInput): Promise<CriarDonoOutput> {
        const dadosDono = EmpresaService.validarDono(
            input.empresaId,
            input.nome,
            input.email,
            input.telefone,
            input.cpf,
            "dono",
        )
        const id = await this.empresaGateway.criar(dadosDono)
        return {
            ID: id,
        }
    }
}