import { SessaoCaixaRepository } from "../../application/repository/sessao.caixa.repository";
import { PrismaClient } from "@prisma/client";
import { SessaoCaixa } from "../../domain/entity/sessao";

export class SQLSessaoCaixaRepository implements SessaoCaixaRepository{
    constructor(
        private readonly db: PrismaClient
    ){}

    public async salvar(sessao: SessaoCaixa): Promise<string>{
        const dados = sessao.buscarPropriedades()
        await this.db.sessaoCaixa.upsert({
            where: { id: dados!.id},
            update: dados,
            create: dados,
        })
        return dados!.id
    }

    public async buscarAbertaPorFuncionarioId(funcionarioId: string): Promise<SessaoCaixa | null> {
        const dados = await this.db.sessaoCaixa.findFirst({
            where: {
                funcionarioId: funcionarioId,
                status: "aberta"
            }
        })
        if (!dados) return null;

        return SessaoCaixa.reconstituir(
            dados.id,
            dados.funcionarioId!,
            dados.empresaId,
            dados.dataAbertura!,
            dados.valorInicial?.toNumber()!,
            dados.status!,
            dados.totalVendas?.toNumber() ?? 0,
            dados.totalSuprimentos?.toNumber() ?? 0,
            dados.totalSangrias?.toNumber() ?? 0,
            dados.totalRetiradas?.toNumber() ?? 0,
            dados.valorFinal?.toNumber() ?? 0,
            dados.dataFechamento, 
        )
    }
}