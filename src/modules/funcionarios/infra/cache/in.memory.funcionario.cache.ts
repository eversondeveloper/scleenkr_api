import { FuncionarioModelCache } from "./funcionario.model.cache";
import { FuncionarioCache } from "../../application/cache/cache";

export class InMemoryFuncionarioCache implements FuncionarioCache {
    private cache: Record<string, FuncionarioModelCache> = {};

    async set(funcionario: FuncionarioModelCache): Promise<void> {
        this.cache[funcionario.cpf] = funcionario;
    }

    async get(cpf: string): Promise<FuncionarioModelCache | null> {
        return this.cache[cpf] ?? null;
    }
}
