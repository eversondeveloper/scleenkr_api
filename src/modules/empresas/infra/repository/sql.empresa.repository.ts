import { EmpresaRepository } from "../../application/repository/empresa.repository";
import { Empresa } from "../../domain/entity/empresa";
import { PrismaClient } from '@prisma/client'

export class SQLEmpresaRepository implements EmpresaRepository {
    constructor(private readonly db: PrismaClient){}

    public async Salvar(empresa: Empresa): Promise<string> {
        const dados = empresa.buscarPropriedades()
        await this.db.empresa.upsert({
            where: { id: dados!.id},
            update: dados,
            create: dados,
        })
        return dados!.id
    }

    public async BuscarPorCNPJ(cnpj: string): Promise<Empresa | null> {
        const dados = await this.db.empresa.findUnique({
            where: { cnpj }
        })
        return Empresa.reconstituir(
            dados!.id ?? '',
            dados!.cnpj ?? '',
            dados!.razaoSocial ?? '',
            dados!.nomeFantasia ?? '',
            dados!.endereco ?? '',
            dados!.cidade ?? '',
            dados!.estado ?? '',
            dados!.cep ?? '',
            dados!.telefone ?? '',
            dados!.email ?? '',
            dados!.criadoEm ?? '',
            undefined,
            dados!.inscricaoEstadual ?? '',
        )
    }

    public async BuscarPorID(id: string): Promise<Empresa | null> {
        const dados = await this.db.empresa.findUnique({
            where: { id }
        })
        return Empresa.reconstituir(
            dados!.id ?? '',
            dados!.cnpj ?? '',
            dados!.razaoSocial ?? '',
            dados!.nomeFantasia ?? '',
            dados!.endereco ?? '',
            dados!.cidade ?? '',
            dados!.estado ?? '',
            dados!.cep ?? '',
            dados!.telefone ?? '',
            dados!.email ?? '',
            dados!.criadoEm ?? '',
            undefined,
            dados!.inscricaoEstadual ?? '',
        )
    }
}