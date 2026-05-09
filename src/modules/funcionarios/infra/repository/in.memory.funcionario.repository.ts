import { Funcionario } from "../../domain/entity/funcionario";
import { FuncionarioRepository } from "../../application/repository/repository";

export class InMemoryFuncionarioRepository implements FuncionarioRepository {
    private funcionarios: Record<string, Funcionario> = {};

    async criar(funcionario: Funcionario): Promise<string> {
        const dados = funcionario.buscarPropriedades();
        this.funcionarios[dados!.id] = funcionario;
        return dados!.id;
    }

    async buscarPorID(id: string): Promise<Funcionario> {
        const funcionario = this.funcionarios[id];
        if (!funcionario) {
            throw new Error("Funcionário não encontrado");
        }
        return funcionario;
    }
}
