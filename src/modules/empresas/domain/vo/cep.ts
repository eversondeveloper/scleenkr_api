import { AppErro, TipoAppErro} from "@/shared/errors/app.error"

export class CEP {
    constructor(public readonly value: string) {
        if (value.length !== 8) {
            throw new AppErro("cep inválido", TipoAppErro.ENTRADA_INVALIDA)
        }
        Object.freeze(this)
    }
}