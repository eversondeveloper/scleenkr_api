import { EmpresaGateway } from "../../application/gateway/gateway";
import { FuncionarioGatewayDTO } from "./empresa.gateway.dto";

export class InMemoryEmpresaGateway implements EmpresaGateway {
    private empresas: Record<string, FuncionarioGatewayDTO> = {};

    async criar(funcionario: FuncionarioGatewayDTO): Promise<string> {
        this.empresas[funcionario.id] = funcionario
        return funcionario.id;
    }
}
