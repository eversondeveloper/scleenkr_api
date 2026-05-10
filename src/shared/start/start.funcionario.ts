import { PrismaClient } from "@prisma/client";
import { createClient} from "redis";
import { Transporter } from "nodemailer";
import { SQLFuncionarioRepository } from "@/modules/funcionarios/infra/repository/sql.funcionario.repository";
import { RedisFuncionarioCache } from "@/modules/funcionarios/infra/cache/funcionario.cache";
import { SMTPFuncionarioServer } from "@/modules/funcionarios/infra/smtp/smtp.funcionario";
import { CriarFuncionario } from "@/modules/funcionarios/application/usecase/create.funcionario";
import { RegistrarFuncionario } from "@/modules/funcionarios/application/usecase/register.funcionario";
import { BuscarFuncionarioPorID } from "@/modules/funcionarios/application/query/buscar.funcionario.por.id";
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
    
    const criarFuncionario = new CriarFuncionario(cache, repository);
    const registrarFuncionario = new RegistrarFuncionario(cache, smtpServer, repository);
    const buscarFuncionarioPorID = new BuscarFuncionarioPorID(prismaClient);
    
    return {
        repository,
        cache,
        smtpServer,
        criarFuncionario,
        registrarFuncionario,
        buscarFuncionarioPorID
    };
}
