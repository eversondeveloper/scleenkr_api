import { FuncionarioModelCache } from "../../infra/cache/funcionario.model.cache";

export interface FuncionarioCache {
    set(funcionario: FuncionarioModelCache): Promise<void>
    get(cpf: string): Promise<FuncionarioModelCache | null>
}