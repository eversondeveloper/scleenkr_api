import { EmpresaRepository } from "../repository/empresa.repository";
import { Empresa } from "../../domain/entity/empresa";
import { IsOptional, IsString } from "class-validator";
import { validarDto } from "@/shared/validation/validar.dto";

export class CriarEmpresaInput {
    @IsString()
    cnpj!: string

    @IsString()
    razaoSocial!: string

    @IsString()
    nomeFantasia!: string

    @IsString()
    endereco!: string

    @IsString()
    cidade!: string

    @IsString()
    estado!: string

    @IsString()
    cep!: string

    @IsString()
    telefone!: string

    @IsString()
    email!: string

    @IsOptional()
    @IsString()
    inscricaoEstadual?: string
}

export interface CriarEmpresaOutput {
    ID: string
}

export class CriarEmpresa {
    constructor(private readonly empresaRepository: EmpresaRepository){}

    public async run(input: CriarEmpresaInput): Promise<CriarEmpresaOutput> {
        const dto = Object.assign(new CriarEmpresaInput(), input)
        await validarDto(dto)

        const empresa = Empresa.criar(
            dto.cnpj,
            dto.razaoSocial,
            dto.nomeFantasia,
            dto.endereco,
            dto.cidade,
            dto.estado,
            dto.cep,
            dto.telefone,
            dto.email,
            dto?.inscricaoEstadual,
        )
        const id = await this.empresaRepository.Salvar(empresa)
        return {
            ID: id,
        }
    }
}
