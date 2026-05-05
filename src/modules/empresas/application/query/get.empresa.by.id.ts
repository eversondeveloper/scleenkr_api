import { PrismaClient } from "@prisma/client";

export interface BuscarEmpresaPorIDOutput {
    id: string,
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

export class BuscarEmpresaPorID {
    constructor(private readonly db: PrismaClient){}

    public async run(id: string): Promise<BuscarEmpresaPorIDOutput> {
        const dados = await this.db.empresa.findUnique({
            where: { id }
        })
        if (!dados) {
            throw new Error("empresa não encontrada")
        }
        const valorPadrao = "isento"
        return {
            id: dados.id,
            cnpj: dados.cnpj ?? valorPadrao,
            razaoSocial: dados.razaoSocial,
            nomeFantasia: dados.nomeFantasia ?? valorPadrao,
            endereco: dados.endereco ?? valorPadrao,
            cidade: dados.cidade ?? valorPadrao,
            estado: dados.estado ?? valorPadrao,
            cep: dados.cep ?? valorPadrao,
            telefone: dados.telefone ?? valorPadrao,
            email: dados.email ?? valorPadrao,
            inscricaoEstadual: dados.inscricaoEstadual ?? valorPadrao,
        }
    }
}