import { Funcionario } from "../../domain/entity/funcionario";

export interface FuncionarioRepository {
    criar(funcionario: Funcionario): Promise<string>
    buscarPorID(id: string): Promise<Funcionario>
}