import * as vo from '../vo'

export class Empresa {
   private constructor(
        private readonly id: vo.ID,
        private razaoSocial: string,
        private nomeFantasia: string,
        private readonly cnpj: vo.CNPJ,
        private endereco: string,
        private cidade: string,
        private estado: string,
        private cep: vo.CEP,
        private telefone: vo.Telefone,
        private email: vo.Email,
        private readonly criadoEm: Date,
        private atualizadoEm: Date,
        private inscricaoEstadual?: string,
    ) {}

    static criar(
        cnpj: string,
        razaoSocial: string,
        nomeFantasia: string,
        endereco: string,
        cidade: string,
        estado: string,
        cep: string,
        telefone: string,
        email: string,
        inscricaoEstadual?: string
    ): Empresa {
        const agora = new Date()
        if (razaoSocial.length < 5) {
            throw new Error("Sua razão deve possuir mais de 5 caracteres")
        }
        if (nomeFantasia.length < 3) {
            throw new Error("Seu nome fantasia deve possuir mais de 3 caracteres")
        }
        return new Empresa(
            new vo.ID(),
            razaoSocial,
            nomeFantasia,
            new vo.CNPJ(cnpj),
            endereco,
            cidade,
            estado,
            new vo.CEP(cep),
            new vo.Telefone(telefone),
            new vo.Email(email),
            agora,
            agora,
            inscricaoEstadual,
        )
    }

    static reconstituir(
        id: string,
        cnpj: string,
        razaoSocial: string,
        nomeFantasia: string,
        endereco: string,
        cidade: string,
        estado: string,
        cep: string,
        telefone: string,
        email: string,
        criadoEm: Date,
        atualizadoEm?: Date,
        inscricaoEstadual?: string
    ): Empresa {
        return new Empresa(
            new vo.ID(id),
            razaoSocial,
            nomeFantasia,
            new vo.CNPJ(cnpj),
            endereco,
            cidade,
            estado,
            new vo.CEP(cep),
            new vo.Telefone(telefone),
            new vo.Email(email),
            criadoEm,
            atualizadoEm ?? criadoEm,
            inscricaoEstadual,
        )
    }

    public possuiInscricaoEstadual(): boolean {
        return !!this.inscricaoEstadual
    }

    public atualizarInscricaoEstadual(novaInscricaoEstadual: string): void {
        if (novaInscricaoEstadual.length < 8) {
            throw new Error("Insira uma inscrição estadual com o tamanho válido")
        }
        this.inscricaoEstadual = novaInscricaoEstadual
        this.atualizadoEm = new Date()
    }

    public atualizarNomeFantasia(novoNomeFantasia: string): void {
        if (novoNomeFantasia.length < 3) {
            throw new Error("Seu nome fantasia deve possuir mais de 3 caracteres.")
        }
        this.nomeFantasia = novoNomeFantasia
        this.atualizadoEm = new Date()
    }

    public buscarPropriedades() {
        return {
            id: this.id.value,
            razaoSocial: this.razaoSocial,
            nomeFantasia: this.nomeFantasia,
            cnpj: this.cnpj.value,
            endereco: this.endereco,
            cidade: this.cidade,
            estado: this.estado,
            cep: this.cep.value,
            telefone: this.telefone.value,
            email: this.email.value,
            criadoEm: this.criadoEm,
            atualizadoEm: this.atualizadoEm,
            inscricaoEstadual: this.inscricaoEstadual
        }
    }

}