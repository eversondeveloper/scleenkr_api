import { v4 as uuidv4 } from 'uuid';

export class ID {
    public readonly value: string
    constructor(id?: string) {
        this.value = id ?? uuidv4()
        Object.freeze(this)
    }
}