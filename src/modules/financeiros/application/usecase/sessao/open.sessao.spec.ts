import { InMemorySessaoCaixaRepository } from "../../infra/repository/in.memory.sessao.repository";
import { AbrirSessao } from "./open.sessao";

describe('AbrirSessao', () => {
    it("deve abrir uma sessão", async () => {
        const repository = new InMemorySessaoCaixaRepository()
        const handler = new AbrirSessao(repository)

        const out = await handler.run({
            funcionarioId: "funcionario-123",
            empresaId: "empresa-123",
            valorInicial: 200,
        })

        expect(typeof out.id).toBe("string")
        expect(out.id).toBeDefined()
    })

    it("deve emitir erro no valor inicial", async () => {
        const repository = new InMemorySessaoCaixaRepository()
        const handler = new AbrirSessao(repository)

        const input = {
            funcionarioId: "funcionario-123",
            empresaId: "empresa-123",
            valorInicial: -10,
        }

        await expect(handler.run(input)).rejects.toThrow()
    })
})