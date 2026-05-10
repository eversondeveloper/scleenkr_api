import { Request, Response } from "express";
import * as usecase from "@/modules/funcionarios/application/usecase"
import { BuscarFuncionarioPorID } from "../../application/query/buscar.funcionario.por.id";

export class HttpFuncionarioController {
    constructor(
        private readonly registrarFuncionario: usecase.RegistrarFuncionario,
        private readonly criarFuncionario: usecase.CriarFuncionario,
        private readonly buscarFuncionarioPorId: BuscarFuncionarioPorID,
    ){}

    public async registrarFuncionarioHandler(req: Request, res: Response): Promise<Response> {
        const input = req.body
        await this.registrarFuncionario.run({
            funcionarioID: input.funcionarioID,
            email: input.email,
            cpf: input.cpf,
            cargo: input.cargo,
        })
        return res.status(201).json({
            message: "funcionário registrado com sucesso",
        })
    }

    public async criarFuncionarioHandler(req: Request, res: Response): Promise<Response> {
        const input = req.body
        const out = await this.criarFuncionario.run({
            nome: input.nome,
            telefone: input.telefone,
            cpf: input.cpf,
        })
        return res.status(201).json({
            message: out.id,
        })
    }

    public async buscarFuncionarioPorIDHandler(req: Request, res: Response): Promise<Response> {
        const out = await this.buscarFuncionarioPorId.run(req.params.id.toString())
        return res.status(200).json({
            data: out
        })
    }
}
