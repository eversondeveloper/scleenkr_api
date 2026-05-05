import { EmpresaRepository } from "../repository/empresa.repository";
import { Empresa } from "../../domain/entity/empresa";

export interface CriarEmpresaInput {
    cnpj: string,
    razaoSocial: string,
    nomeFantasia: string,
    endereco: string,
    cidade: string,
    estado: string,
    cep: string,
    telefone: string,
    email: string,
    inscricaoEstadual?: string
}

export interface CriarEmpresaOutput {
    ID: string
}

export class CriarEmpresa {
    constructor(private readonly empresaRepository: EmpresaRepository){}

    public async run(input: CriarEmpresaInput): Promise<CriarEmpresaOutput> {
        const empresa = Empresa.criar(
            input.cnpj,
            input.razaoSocial,
            input.nomeFantasia,
            input.endereco,
            input.cidade,
            input.estado,
            input.cep,
            input.telefone,
            input.email,
            input?.inscricaoEstadual,
        )
        const id = await this.empresaRepository.Salvar(empresa)
        return {
            ID: id,
        }
    }
}