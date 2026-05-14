import { AppErro, TipoAppErro } from "@/shared/errors/app.error";
import * as vo from "@/shared/vo"

type sessaoData = {
    id: string,
    funcionarioId: string,
    empresaId: string,
    dataAbertura: Date,
    valorInicial: number,
    status: string,
    totalVendas: number,
    totalSuprimentos: number,
    totalSangrias: number,
    totalRetiradas: number,
    valorFinal?: number,
    dataFechamento?: Date | null,
}
export class SessaoCaixa {
    private constructor(
        private readonly id: vo.ID,
        private funcionarioId: string,
        private empresaId: string,
        private dataAbertura: Date,
        private valorInicial: number,
        private status: string,
        private totalVendas: number,
        private totalSuprimentos: number,
        private totalSangrias: number,
        private totalRetiradas: number,
        private valorFinal?: number,
        private dataFechamento?: Date | null,
    ){}
    static abrir(
        funcionarioId: string,
        empresaId: string,
        valorInicial: number,
    ): SessaoCaixa {
        const agora = new Date()
        return new SessaoCaixa(
            new vo.ID(),
            funcionarioId,
            empresaId,
            agora,
            valorInicial,
            "aberta",
            0,
            0,
            0,
            0,
            undefined,
            undefined,
        )
    }
    static reconstituir(
        id: string,
        funcionarioId: string,
        empresaId: string,
        dataAbertura: Date,
        valorInicial: number,
        status: string,
        totalVendas: number,
        totalSuprimentos: number,
        totalSangrias: number,
        totalRetiradas: number,
        valorFinal?: number,
        dataFechamento?: Date | null,
    ): SessaoCaixa {
        return new SessaoCaixa(
            new vo.ID(id),
            funcionarioId,
            empresaId,
            dataAbertura,
            valorInicial,
            status,
            totalVendas,
            totalSuprimentos,
            totalSangrias,
            totalRetiradas,
            valorFinal,
            dataFechamento,
        )
    }

    private garantirSessaoAberta(): void {
        if (this.status !== "aberta"){
            throw new AppErro("você não tem uma sessão aberta para ser fechada", TipoAppErro.OPERACAO_INVALIDA)
        }
    }

    private buscarSaldoAtual(): number {
        return (this.valorInicial + this.totalSuprimentos + this.totalVendas) - this.totalSangrias
    }

    public fechar(valorFinal: number): number {
        this.garantirSessaoAberta()
        if (valorFinal < 0) {
            throw new AppErro("seu valor final não pode ser menor que zero", TipoAppErro.ENTRADA_INVALIDA)
        }
        this.valorFinal = valorFinal
        this.dataFechamento = new Date()
        this.status = "fechada"
        return valorFinal - this.buscarSaldoAtual()
    }

    public adicionarSuprimentos(suprimento: number): void {
        this.garantirSessaoAberta()
        if (suprimento < 0) {
            throw new AppErro("o suprimento não pode ser menor que zero", TipoAppErro.OPERACAO_INVALIDA) 
        }
        this.totalSuprimentos += suprimento 
    }

    public adicionarVendas(valorVenda: number): void {
         this.garantirSessaoAberta()
        if (valorVenda < 0) {
            throw new AppErro("o valor da venda não pode ser menor que zero", TipoAppErro.OPERACAO_INVALIDA) 
        }
        this.totalVendas += valorVenda
    }

    public realizarSangria(valor: number): void {
        this.garantirSessaoAberta()
        if (valor > this.buscarSaldoAtual()) {
            throw new AppErro("o valor da sangria não pode ser maior que o saldo atual", TipoAppErro.OPERACAO_INVALIDA)
        }
        if (valor < 0) {
            throw new AppErro("o valor da sangria não pode ser menor que zero", TipoAppErro.ENTRADA_INVALIDA)
        }
        this.totalSangrias += valor
    }
    
    public realizarRetirada(valor: number): void {
        if (valor > this.buscarSaldoAtual()) {
            throw new AppErro("o valor da retirada não pode ser maior que o saldo atual", TipoAppErro.OPERACAO_INVALIDA)
        }
        if (valor < 0) {
            throw new AppErro("o valor da retirada não pode ser menor que zero", TipoAppErro.ENTRADA_INVALIDA)
        }
        this.totalRetiradas += valor
    }

    public buscarPropriedades(): sessaoData {
        return {
            id: this.id.value,
            funcionarioId: this.funcionarioId,
            empresaId: this.empresaId,
            dataAbertura: this.dataAbertura,
            valorInicial: this.valorInicial,
            status: this.status,
            totalVendas: this.totalVendas,
            totalSuprimentos: this.totalSuprimentos,
            totalSangrias: this.totalSangrias,
            totalRetiradas: this.totalRetiradas,
            valorFinal: this.valorFinal,
            dataFechamento: this.dataFechamento
        }
    }
}