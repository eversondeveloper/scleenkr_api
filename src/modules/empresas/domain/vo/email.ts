export class Email {
    constructor(public readonly value: string){
        const regex: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!regex.test(value)) {
            throw new Error("email inválido")
        }
        Object.freeze(this)
    }
}