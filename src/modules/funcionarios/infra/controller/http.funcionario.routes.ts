import { Router } from 'express'
import { HttpFuncionarioController } from './http.funcionario.controller'
import { manipuladorAssincrono } from '@/middlewares/async.handler'

export class RotasFuncionarios {
    private readonly router: Router
    constructor(private readonly controller: HttpFuncionarioController) {
        this.router = Router()
        this.iniciarRotas()
    }
    private iniciarRotas(): void {
        this.router.post(
            "/funcionario/registrar",
            manipuladorAssincrono(
                this.controller.registrarFuncionarioHandler.bind(this.controller)
            )
        )
        this.router.post(
            "/funcionario",
            manipuladorAssincrono(
                this.controller.criarFuncionarioHandler.bind(this.controller)
            )
        )
        this.router.get(
            "/funcionario/:id",
            manipuladorAssincrono(
                this.controller.buscarFuncionarioPorIDHandler.bind(this.controller)
            )
        )
    }

    public getRouter(): Router {
        return this.router;
    }
}
