export class CEP {
    constructor(public readonly value: string) {
        if (value.length !== 8) {
            throw new Error("CEP inválido")
        }
        Object.freeze(this)
    }
}