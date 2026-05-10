import 'dotenv/config'
import { PrismaClient } from "@prisma/client";
import { iniciarAdapatador } from './config/database.config';
import { startEmpresa } from './shared/start/start.empresa';
import { startFuncionario } from './shared/start/start.funcionario';
import express from "express";
import morgan from 'morgan'
import { erroMiddleware } from "./middlewares/error.handler";
import { createClient } from 'redis';
import { createTransport } from 'nodemailer';

const adapter = iniciarAdapatador()
const prismaClient = new PrismaClient({adapter})
const app = express()

app.use(morgan("dev"))
app.use(express.json())

const redisClient = createClient({
    socket: {
        host: 'localhost',
        port: 6379
    },
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.connect().catch(console.error);

const smtpTransporter = createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const smtpUser = process.env.SMTP_USER || '';

startEmpresa({
    prismaClient,
    app
})

startFuncionario({
    prismaClient,
    app,
    redisClient,
    smtpTransporter,
    smtpUser
})

app.use(erroMiddleware)
app.listen(8080, () => {
    console.log("Server rodando em http://localhost:8080/")
})