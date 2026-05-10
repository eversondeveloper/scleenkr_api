import { Request, Response } from "express";
import * as usecase from "@/modules/empresas/application/usecase"
import { BuscarEmpresaPorID } from "../../application/query/get.empresa.by.id";

export class HttpEmpresaController {
    constructor(
        private readonly criarEmpresa: usecase.CriarEmpresa,
        private readonly atualizarInscricaoEstadual: usecase.AtualizarInscricaoEstadual,
        private readonly buscarEmpresaPorId: BuscarEmpresaPorID,
        private readonly criarDono: usecase.CriarDono,
    ){}

    public async criarEmpresaHandler(req: Request, res: Response): Promise<Response> {
        const input = req.body
        const out = await this.criarEmpresa.run({
            cnpj: input.cnpj,
            razaoSocial: input.razaoSocial,
            nomeFantasia: input.nomeFantasia,
            endereco: input.endereco,
            cidade: input.cidade,
            estado: input.estado,
            cep: input.cep,
            telefone: input.telefone,
            email: input.email,
            inscricaoEstadual: input?.inscricaoEstadual,
        })
        return res.status(201).json({
            message: out.ID,
        })
    }

    public async atualizarInscricaoEstadualHandler(req: Request, res: Response): Promise<Response> {
        const id = req.params.id
        const input = req.body
        const out = await this.atualizarInscricaoEstadual.run({
            id: id.toString(),
            inscricaoEstadual: input.inscricaoEstadual,
        })
        return res.status(200).json({
            message: out.id,
        })
    }

    public async buscarEmpresaPorIDHandler(req: Request, res: Response): Promise<Response> {
        const out = await this.buscarEmpresaPorId.run(req.params.id.toString())
        return res.status(200).json({
            data: out
        })
    }

    public async criarDonoHandler(req: Request, res: Response): Promise<Response> {
        const input = req.body
        const out = await this.criarDono.run({
            empresaID: input.EmpresaId,
            nome:  input.nome,
            email: input.email,
            telefone: input.telefone,
            cpf: input.cpf,
        })
        return res.status(201).json({
            message: out.ID
        })
    }
}