import { FuncionarioGatewayDTO } from "@/modules/empresas/infra/gateway/empresa.gateway.dto";

export interface EmpresaGateway {
    criar(funcionarioData: FuncionarioGatewayDTO): Promise<string>;
}
