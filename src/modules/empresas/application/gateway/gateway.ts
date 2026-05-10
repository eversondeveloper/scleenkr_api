import { FuncionarioGatewayDTO } from "@/modules/empresas/infra/gateway/empresa.gateway.dto";

export interface EmpresaGateway {
    criar(empresa: FuncionarioGatewayDTO): Promise<string>;
}
