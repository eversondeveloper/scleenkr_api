import { Empresa } from "../../domain/entity/empresa";

export interface EmpresaRepository {
    Salvar(empresa: Empresa): Promise<string>
    BuscarPorID(id: string): Promise<Empresa | null>
    BuscarPorCNPJ(cnpj: string): Promise<Empresa | null>
}