export enum TipoAppErro {
    ENTRADA_INVALIDA = "entrada_invalida",
    ERRO_INTERNO = "erro_interno",
    NAO_ENCONTRADO = "nao_encontrado",
    ACESSO_NEGADO = "acesso_negado",
    OPERACAO_INVALIDA = "operacao_invalida",
    NAO_AUTENTICADO = "nao_autenticado"
}

export class AppErro extends Error {
    constructor(
        public mensagem: string,
        public tipoDoErro: TipoAppErro,
    ){
        super(mensagem)
        this.name = "AppErro"
    } 
}

