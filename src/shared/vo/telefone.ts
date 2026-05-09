import { AppErro, TipoAppErro } from "@/shared/errors/app.error"

export class Telefone {
    constructor(public readonly value: string) {
        if (value.length > 11 || value.length < 10) {
            throw new AppErro("número de telefone inválido", TipoAppErro.ENTRADA_INVALIDA)
        }
        Object.freeze(this)
    }
}