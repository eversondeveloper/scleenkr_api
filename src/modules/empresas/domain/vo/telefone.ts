export class Telefone {
    constructor(public readonly value: string) {
        if (value.length > 11 || value.length < 10) {
            throw new Error("Número de telefone inválido")
        }
        Object.freeze(this)
    }
}