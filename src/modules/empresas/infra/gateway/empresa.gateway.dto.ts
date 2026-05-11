export interface FuncionarioGatewayDTO {
    id: string;
    empresaId: string;
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
    ativo: boolean;
    cargo: string;
    criadoEm: Date;
    atualizadoEm: Date;
}
