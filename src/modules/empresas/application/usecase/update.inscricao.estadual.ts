import { EmpresaRepository } from "../repository/empresa.repository";
import { Empresa } from "../../domain/entity/empresa";

export interface AtualizarInscricaoEstadualInput {
    id: string;
    inscricaoEstadual: string;
}

export interface AtualizarInscricaoEstadualoutput {
    id: string,
}

export class AtualizarInscricaoEstadual {
    constructor(private readonly empresaRepository: EmpresaRepository){}

    public async run(input: AtualizarInscricaoEstadualInput): Promise<AtualizarInscricaoEstadualoutput> {
        const empresa = await this.empresaRepository.BuscarPorID(input.id)
        empresa?.atualizarInscricaoEstadual(input.inscricaoEstadual)
        const id = await this.empresaRepository.Salvar(empresa!)
        return {
            id: id
        }
    }
}