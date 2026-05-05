import { TipoAppErro, AppErro } from "./app.erro";

type RespostaDeErroHttp = {
  status: number;
  mensagem: string;
}


export class ManipuladorDeErro {
    private static MapeadorDeErroHTTP: Record<TipoAppErro, number> = {
        [TipoAppErro.ENTRADA_INVALIDA]: 400,
        [TipoAppErro.NAO_AUTENTICADO]: 401,
        [TipoAppErro.ACESSO_NEGADO]: 403,
        [TipoAppErro.NAO_ENCONTRADO]: 404,
        [TipoAppErro.OPERACAO_INVALIDA]: 422,
        [TipoAppErro.ERRO_INTERNO]: 500,
    }
    static http(erro: unknown): RespostaDeErroHttp {
        if (erro instanceof AppErro) {
            return {
                status: this.MapeadorDeErroHTTP[erro.tipoDoErro] ?? 500,
                mensagem: erro.message
            }
        }
        return {
            status: 500,
            mensagem: "erro interno"
        }
    }
}