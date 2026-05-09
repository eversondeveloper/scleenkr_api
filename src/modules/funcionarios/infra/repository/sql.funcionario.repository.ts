import { PrismaClient } from "@prisma/client";
import { Funcionario } from "../../domain/entity/funcionario";
import { FuncionarioRepository } from "../../application/repository/repository";

class SQLFuncionarioRepository implements FuncionarioRepository {
    constructor(private readonly db: PrismaClient) {}

    async criar(funcionario: Funcionario): Promise<string> {
        const dados = funcionario.buscarPropriedades();
        await this.db.funcionario.upsert({
            where: { id: dados!.id},
            update: dados,
            create: dados,
        })

        return dados!.id
    }

    async buscarPorID(id: string): Promise<Funcionario> {
        const funcionario = await this.db.funcionario.findUnique({
            where: { id }
        })

        const agora = new Date();

        return Funcionario.reconstituir(
            funcionario!.id ?? "",
            funcionario!.empresaId ?? "",
            funcionario!.nome ?? "",
            funcionario!.email ?? "",
            funcionario!.telefone ?? "",
            funcionario!.cpf ?? "",
            funcionario!.ativo ?? false,
            funcionario!.cargo ?? "",
            funcionario!.criadoEm ?? agora,
            funcionario!.atualizadoEm ?? agora,
        );
    }
}