import { Empresa } from "../../domain/entity/empresa";
import { EmpresaRepository } from "../../application/repository/empresa.repository";

export class InMemoryEmpresaRepository implements EmpresaRepository {
    private empresas = new Map<string, Empresa>();
    private empresasPorCNPJ = new Map<string, Empresa>();

    async Salvar(empresa: Empresa): Promise<string> {
        const props = empresa.buscarPropriedades();
        this.empresas.set(props.id, empresa);
        this.empresasPorCNPJ.set(props.cnpj, empresa);
        return props.id;
    }

    async BuscarPorID(id: string): Promise<Empresa | null> {
        return this.empresas.get(id) ?? null;
    }

    async BuscarPorCNPJ(cnpj: string): Promise<Empresa | null> {
        return this.empresasPorCNPJ.get(cnpj) ?? null;
    }
}
