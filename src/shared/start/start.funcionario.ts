import { PrismaClient } from "@prisma/client";
import { createClient} from "redis";
import { Transporter } from "nodemailer";
import { SQLFuncionarioRepository } from "@/modules/funcionarios/infra/repository/sql.funcionario.repository";
import { RedisFuncionarioCache } from "@/modules/funcionarios/infra/cache/funcionario.cache";
import { SMTPFuncionarioServer } from "@/modules/funcionarios/infra/smtp/smtp.funcionario";
import * as usecase from "@/modules/funcionarios/application/usecase"
import { BuscarFuncionarioPorID } from "@/modules/funcionarios/application/query/buscar.funcionario.por.id";
import { HttpFuncionarioController } from "@/modules/funcionarios/infra/controller/http.funcionario.controller";
import { RotasFuncionarios } from "@/modules/funcionarios/infra/controller/http.funcionario.routes";
import express from "express";

export interface FuncionarioInfra {
    prismaClient: PrismaClient;
    app: express.Express;
    redisClient: ReturnType<typeof createClient>;
    smtpTransporter: Transporter;
    smtpUser: string;
}

export function startFuncionario(infra: FuncionarioInfra) {
    const { prismaClient, app, redisClient, smtpTransporter, smtpUser } = infra;
    
    const repository = new SQLFuncionarioRepository(prismaClient);
    const cache = new RedisFuncionarioCache(redisClient);
    const smtpServer = new SMTPFuncionarioServer(smtpTransporter, smtpUser);
    
    const criarFuncionario = new usecase.CriarFuncionario(cache, repository);
    const registrarFuncionario = new usecase.RegistrarFuncionario(cache, smtpServer, repository);
    const buscarFuncionarioPorID = new BuscarFuncionarioPorID(prismaClient);

    const controller = new HttpFuncionarioController(
        registrarFuncionario,
        criarFuncionario,
        buscarFuncionarioPorID,
    )

    const rotas = new RotasFuncionarios(controller)

    infra.app.use(rotas.getRouter())
    
    return {
        repository,
        cache,
        smtpServer,
        criarFuncionario,
        registrarFuncionario,
        buscarFuncionarioPorID
    };
}
