import { EmpresaRepository } from "../repository/empresa.repository";
import { Empresa } from "../../domain/entity/empresa";

export interface AtualizarInscricaoEstadualInput {
    id: string;
    inscricaoEstadual: string;
}

export interface AtualizarInscricaoEstadualOutput {
    id: string,
}

export class AtualizarInscricaoEstadual {
    constructor(private readonly empresaRepository: EmpresaRepository){}

    public async run(input: AtualizarInscricaoEstadualInput): Promise<AtualizarInscricaoEstadualOutput> {
        const empresa = await this.empresaRepository.BuscarPorID(input.id)
        empresa?.atualizarInscricaoEstadual(input.inscricaoEstadual)
        const id = await this.empresaRepository.Salvar(empresa!)
        return {
            id: id
        }
    }
}