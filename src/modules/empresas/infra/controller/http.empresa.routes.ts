import { Router } from 'express'
import { HttpEmpresaController } from './http.empresa.controller'
import { manipuladorAssincrono } from '@/middlewares/async.handler'

export class RotasEmpresas {
    private readonly router: Router
    constructor(private readonly controller: HttpEmpresaController) {
        this.router = Router()
        this.iniciarRotas()
    }
    private iniciarRotas(): void {
        this.router.post(
            "/empresa",
            manipuladorAssincrono(
                this.controller.criarEmpresaHandler.bind(this.controller)
            )
        )
        this.router.put(
            "/empresa/:id",
            manipuladorAssincrono(
                this.controller.atualizarInscricaoEstadualHandler.bind(this.controller)
            )
        )
        this.router.get(
            "/empresa/:id",
            manipuladorAssincrono(
                this.controller.buscarEmpresaPorIDHandler.bind(this.controller)
            )
        )

        this.router.post(
            "/empresa/dono",
            manipuladorAssincrono(
                this.controller.criarDonoHandler.bind(this.controller)
            )
        )
    }

    public getRouter(): Router {
        return this.router;
    }
}
