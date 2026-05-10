import { PrismaClient } from "@prisma/client";
import { AppErro, TipoAppErro } from "@/shared/errors/app.error";

export interface BuscarFuncionarioPorIDOutput {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
    ativo: boolean;
    cargo: string;
    empresaID: string;
    criadoEm: Date;
    atualizadoEm: Date;
}

export class BuscarFuncionarioPorID {
    constructor(private readonly db: PrismaClient) {}

    public async run(id: string): Promise<BuscarFuncionarioPorIDOutput> {
        const funcionario = await this.db.funcionario.findUnique({
            where: { id }
        });

        if (!funcionario) {
            throw new AppErro("funcionário não encontrado", TipoAppErro.NAO_ENCONTRADO)
        }

        return {
            id: funcionario.id,
            nome: funcionario.nome,
            email: funcionario.email,
            telefone: funcionario.telefone ?? '',
            cpf: funcionario.cpf ?? '',
            ativo: funcionario.ativo ?? false,
            cargo: funcionario.cargo,
            empresaID: funcionario.empresaId,
            criadoEm: funcionario.criadoEm,
            atualizadoEm: funcionario.atualizadoEm
        };
    }
}
