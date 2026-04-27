export class CNPJ {
    constructor(public readonly value: string) {
        if (value.length !== 14) {
            throw new Error("CNPJ inválido")
        }
        Object.freeze(this)
    }
}