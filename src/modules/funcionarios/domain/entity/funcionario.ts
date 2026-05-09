import * as vo from '@/shared/vo'
import { CPF} from '../vo/cpf'
import { AppErro, TipoAppErro } from '@/shared/errors/app.error'

export class Funcionario {
    private constructor(
        private readonly id: vo.ID,
        private readonly empresaID: string,
        private nome: string,
        private email: vo.Email,
        private telefone: vo.Telefone,
        private cpf: CPF,
        private ativo: boolean,
        private cargo: string,
        private readonly criadoEm: Date,
        private atualizadoEm: Date,
    ){}

    private static esteCargoExiste(cargo: string): boolean {
        return ["dono", "gerente", "atendente"].includes(cargo.toLowerCase())
    }

    static criar(
       empresaID: string,
       nome: string,
       email: string,
       telefone: string,
       cpf: string,
       ativo: boolean,
       cargo: string,
    ): Funcionario {
        const agora = new Date()
        if (nome.length < 5) {
            throw new AppErro("seu nome deve ter mais de 4 caracteres", TipoAppErro.ENTRADA_INVALIDA)
        }
        if (!Funcionario.esteCargoExiste(cargo)) {
            throw new AppErro("insira um cargo válido", TipoAppErro.ENTRADA_INVALIDA)
        }
        return new Funcionario(
            new vo.ID(),
            empresaID,
            nome,
            new vo.Email(email),
            new vo.Telefone(telefone),
            new CPF(cpf),
            ativo,
            cargo,
            agora,
            agora,
        )
    }
    static reconstituir(
        id: string,
        empresaID: string,
        nome: string,
        email: string,
        telefone: string,
        cpf: string,
        ativo: boolean,
        cargo: string,
        criadoEm: Date,
        atualizadoEm?: Date,
    ): Funcionario {
        return new Funcionario(
            new vo.ID(id),
            empresaID,
            nome,
            new vo.Email(email),
            new vo.Telefone(telefone),
            new CPF(cpf),
            ativo,
            cargo,
            criadoEm,
            atualizadoEm ?? criadoEm,
        )
    }

    public funcionarioEstaAtivo(): boolean {
        return this.ativo
    }

    public temCapacidadeDeGestao(): boolean {
        if (!this.funcionarioEstaAtivo()) {
            return false
        }
        const cargosPermitidos: string[] = ["dono", "gerente"]
        return cargosPermitidos.includes(this.cargo)
    }

    public validarIntencaoDeNovoFuncionario(
        email: string,
        cpf: string,
        cargo: string,
    ): any {
        if (!Funcionario.esteCargoExiste(cargo)) {
            throw new AppErro("este cargo não existe", TipoAppErro.ENTRADA_INVALIDA)
        }
        const emailValidado = new vo.Email(email)
        const cpfValidado = new CPF(cpf)
        return {
            email: emailValidado.value,
            cpf: cpfValidado.value,
            cargo: cargo.toLowerCase(),
            empresaID: this.empresaID,
            atividade: false,
        }
    }

    private validarHierarquia(executor: Funcionario): boolean {
        return !(this.cargo == "dono" && executor.cargo == "gerente")
    }

    public alterarCargoPara(cargo: string, executor: Funcionario): void {
        if(!Funcionario.esteCargoExiste(cargo)) {
            throw new AppErro("insira um cargo válido", TipoAppErro.ENTRADA_INVALIDA)
        }
        if (!executor.temCapacidadeDeGestao()) {
            throw new AppErro("o executor não tem permissão para alterar o cargo", TipoAppErro.ACESSO_NEGADO)
        }
        if (!this.validarHierarquia(executor)) {
            throw new AppErro("o executor não permissão para alterar este funcionário", TipoAppErro.ACESSO_NEGADO)
        }
        if (!this.funcionarioEstaAtivo()) {
            throw new AppErro("o funcionário precisa estar ativo", TipoAppErro.OPERACAO_INVALIDA)
        }
        this.cargo = cargo.toLowerCase()
        this.atualizadoEm = new Date()
    }

    public alterarAtividadeParaFalso(executor: Funcionario): void {
        if (!executor.temCapacidadeDeGestao()) {
            throw new AppErro("o executor não tem permissão para alterar a atividade", TipoAppErro.ACESSO_NEGADO)
        }
        if (!this.validarHierarquia(executor)) {
            throw new AppErro("o executor não permissão para alterar este funcionário", TipoAppErro.ACESSO_NEGADO)
        }
        if (!this.funcionarioEstaAtivo()) {
            throw new AppErro("o funcionário já está inativo", TipoAppErro.OPERACAO_INVALIDA)
        }
        this.ativo = false
        this.atualizadoEm = new Date()
    }
}
