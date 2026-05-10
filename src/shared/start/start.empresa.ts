import { PrismaClient } from "@prisma/client";
import { SQLEmpresaRepository } from "@/modules/empresas/infra/repository/sql.empresa.repository";
import * as usecase from "@/modules/empresas/application/usecase"
import { BuscarEmpresaPorID } from "@/modules/empresas/application/query/get.empresa.by.id";
import { HttpEmpresaController } from "@/modules/empresas/infra/controller/http.empresa.controller";
import { RotasEmpresas } from "@/modules/empresas/infra/controller/http.empresa.routes";
import { InMemoryEmpresaGateway } from "@/modules/empresas/infra/gateway/in.memory.empresa.gateway";
import { SQLEmpresaGateway } from "@/modules/empresas/infra/gateway/sql.empresa.gateway";
import express from "express";

export interface EmpresaInfra {
    prismaClient: PrismaClient;
    app: express.Express;
}

export function startEmpresa(infra: EmpresaInfra) {
    const { prismaClient, app } = infra;
    
    const repository = new SQLEmpresaRepository(prismaClient);
    
    const sqlEmpresaGateway = new SQLEmpresaGateway(prismaClient);
    const inMemoryEmpresaGateway = new InMemoryEmpresaGateway();
    
    const criarEmpresa = new usecase.CriarEmpresa(repository);
    const atualizarInscricaoEstadual = new usecase.AtualizarInscricaoEstadual(repository);
    const buscarEmpresaPorID = new BuscarEmpresaPorID(prismaClient);
    
    const controller = new HttpEmpresaController(
        criarEmpresa,
        atualizarInscricaoEstadual,
        buscarEmpresaPorID,
    );
    
    const routes = new RotasEmpresas(controller);

    app.use(routes.getRouter());
    
    return {
        controller,
        routes,
        repository,
        sqlEmpresaGateway,
        inMemoryEmpresaGateway
    };
}
