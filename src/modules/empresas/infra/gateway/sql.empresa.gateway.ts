import { PrismaClient } from "@prisma/client";
import { EmpresaGateway } from "../../application/gateway/gateway";
import { FuncionarioGatewayDTO } from "./empresa.gateway.dto";

export class SQLEmpresaGateway implements EmpresaGateway {
    constructor(private readonly db: PrismaClient) {}

    async criar(funcionarioData: FuncionarioGatewayDTO): Promise<string> {
        await this.db.funcionario.create({
            data: {
                id: funcionarioData.id,
                empresaId: funcionarioData.empresaID,
                nome: funcionarioData.nome,
                email: funcionarioData.email,
                telefone: funcionarioData.telefone,
                cpf: funcionarioData.cpf,
                ativo: funcionarioData.ativo,
                cargo: funcionarioData.cargo,
                criadoEm: funcionarioData.criadoEm,
                atualizadoEm: funcionarioData.atualizadoEm
            }
        });

        return funcionarioData.id;
    }
}