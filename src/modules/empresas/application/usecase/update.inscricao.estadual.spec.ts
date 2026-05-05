import { AtualizarInscricaoEstadual } from "./update.inscricao.estadual";
import { InMemoryEmpresaRepository } from "../../infra/repository/in.memory.empresa.repository";
import { Empresa } from "../../domain/entity/empresa";

describe('CriarEmpresa', () => {
    it('deve atualizar a inscricao estadual', async () => {
        const repository = new InMemoryEmpresaRepository()
        const atualizarInscricaoEstadual = new AtualizarInscricaoEstadual(repository)
        const empresa = Empresa.criar(
            "12345678000190",
            "teste",
            "nome de teste",
            "teste",
            "teste",
            "RN",
            "01234567",
            "99999999999",
            "teste@test.com",
        )
        const id = await repository.Salvar(empresa)
        const result = await atualizarInscricaoEstadual.run({id: id, inscricaoEstadual: "nova inscricao"})

        expect(result.id).toBe(id)
        console.log(await repository.BuscarPorID(result.id))
    })
})