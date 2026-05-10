import { Funcionario } from "@/modules/funcionarios/domain/entity/funcionario";
import { FuncionarioGatewayDTO } from "../../infra/gateway/empresa.gateway.dto";

type DonoValidado = FuncionarioGatewayDTO
export class EmpresaService {
    public static validarDono(
        empresaID: string,
        nome: string,
        email: string,
        telefone: string,
        cpf: string,
        cargo: string,
    ): DonoValidado {
        const funcionario = Funcionario.criar(
            empresaID,
            nome,
            email,
            telefone,
            cpf,
            true,
            cargo,
        )
        return funcionario.buscarPropriedades()
    }
}