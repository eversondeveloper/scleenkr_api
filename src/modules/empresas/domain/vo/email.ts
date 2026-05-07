import { AppErro, TipoAppErro } from "@/shared/errors/app.error"

export class Email {
    constructor(public readonly value: string){
        const regex: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!regex.test(value)) {
            throw new AppErro("email inválido", TipoAppErro.ENTRADA_INVALIDA)
        }
        Object.freeze(this)
    }
}