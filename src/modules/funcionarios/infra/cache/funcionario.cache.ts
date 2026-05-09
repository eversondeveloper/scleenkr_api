import { RedisClientType } from "redis";
import { FuncionarioModelCache } from "./funcionario.model.cache";
import { FuncionarioCache } from "../../application/cache/cache";

export class RedisFuncionarioCache implements FuncionarioCache{
    constructor(private readonly rdb: RedisClientType){}

    public async set(funcionario: FuncionarioModelCache): Promise<void> {
        await this.rdb.set(funcionario.cpf, JSON.stringify(funcionario), {EX: 3600*2})
    }

    public async get(cpf: string): Promise<FuncionarioModelCache | null> {
        const dados = await this.rdb.get(cpf) 
        if (!dados) {
            return null
        }
        return JSON.parse(dados) as FuncionarioModelCache 
    }
}