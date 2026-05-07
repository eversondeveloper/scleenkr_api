import { AppErro, TipoAppErro } from "@/shared/errors/app.error"

export class CNPJ {
    constructor(public readonly value: string) {
        if (value.length !== 14) {
            throw new AppErro("cnpj inválido", TipoAppErro.ENTRADA_INVALIDA)
        }
        Object.freeze(this)
    }
}