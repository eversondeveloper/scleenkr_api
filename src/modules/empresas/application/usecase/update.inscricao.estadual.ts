import { EmpresaRepository } from "../repository/empresa.repository";
import { IsString } from "class-validator";
import { validarDto } from "@/shared/validation/validar.dto";

export class AtualizarInscricaoEstadualInput {
    @IsString()
    id!: string;

    @IsString()
    inscricaoEstadual!: string;
}

export interface AtualizarInscricaoEstadualOutput {
    id: string,
}

export class AtualizarInscricaoEstadual {
    constructor(private readonly empresaRepository: EmpresaRepository){}

    public async run(input: AtualizarInscricaoEstadualInput): Promise<AtualizarInscricaoEstadualOutput> {
        const dto = Object.assign(new AtualizarInscricaoEstadualInput(), input)
        await validarDto(dto)

        const empresa = await this.empresaRepository.BuscarPorID(dto.id)
        empresa?.atualizarInscricaoEstadual(dto.inscricaoEstadual)
        const id = await this.empresaRepository.Salvar(empresa!)
        return {
            id: id
        }
    }
}
