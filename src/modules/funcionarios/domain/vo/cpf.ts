import { AppErro, TipoAppErro } from "@/shared/errors/app.error";

export class CPF {
    constructor(public readonly value: string) {
        if (value.length !== 11) {
            throw new AppErro("cpf inválido", TipoAppErro.ENTRADA_INVALIDA)
        }
        Object.freeze(this)
    }
}