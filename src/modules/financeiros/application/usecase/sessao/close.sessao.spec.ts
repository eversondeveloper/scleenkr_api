import { InMemorySessaoCaixaRepository } from "@/modules/financeiros/infra/repository/in.memory.sessao.repository";
import { SessaoCaixa } from "@/modules/financeiros/domain/entity/sessao";
import { FecharSessao } from "./close.sessao";

describe("FecharSessao", () => {
    it("deve fechar sessão", async () => {
        const repository = new InMemorySessaoCaixaRepository()
        const handler = new FecharSessao(repository)
        const sessaoCaixa = SessaoCaixa.abrir(
            "funcionario-123",
            "empresa-123",
            200,
        )

        repository.salvar(sessaoCaixa)
        const out = await handler.run({
            funcionarioId: "funcionario-123",
            valorFinal: 600.50,
        })

        console.log(out)
        expect(out.id).toBe(sessaoCaixa.buscarPropriedades().id)
    })
})