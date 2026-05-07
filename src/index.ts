import 'dotenv/config'
import { PrismaClient } from "@prisma/client";
import { iniciarAdapatador } from './config/database.config';
import { SQLEmpresaRepository } from "./modules/empresas/infra/repository/sql.empresa.repository";
import * as usecase from "@/modules/empresas/application/usecase"
import { BuscarEmpresaPorID } from "./modules/empresas/application/query/get.empresa.by.id";
import { HttpEmpresaController } from "./modules/empresas/infra/controller/http.empresa.controller";
import { RotasEmpresas } from "./modules/empresas/infra/controller/http.empresa.routes";
import express from "express";
import { erroMiddleware } from "./middlewares/error.handler";

const adapter = iniciarAdapatador()
const prismaClient = new PrismaClient({adapter})
const repository = new SQLEmpresaRepository(prismaClient)
const criarEmpresa = new usecase.CriarEmpresa(repository)
const atualizarInscricaoEstadual = new usecase.AtualizarInscricaoEstadual(repository)
const buscarEmpresaPorID = new BuscarEmpresaPorID(prismaClient)
const controller = new HttpEmpresaController(
    criarEmpresa,
    atualizarInscricaoEstadual,
    buscarEmpresaPorID,
)
const routes = new RotasEmpresas(controller)
const app = express()
app.use(erroMiddleware)
app.use(express.json())
app.use(routes.getRouter())
app.listen(8080, () => {
    console.log("Server rodando em http://localhost:8080/")
})