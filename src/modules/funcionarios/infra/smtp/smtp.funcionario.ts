import { Transporter } from "nodemailer";
import { SMTPServer } from "../../application/smtp/smtp";
import { SMTPFuncionarioDTO } from "./smtp.funcionario.model";

export class SMTPFuncionarioServer implements SMTPServer {
    constructor(
        private readonly client: Transporter,
        private readonly user: string,
    ) {}

    async enviar(dados: SMTPFuncionarioDTO): Promise<void> {
        await this.client.sendMail({
            from: `${this.user}`,
            to: dados.email,
            subject: `Bem-vindo ao cargo de ${dados.cargo}`,
            text: `Acesse o link: ${dados.link}`
        });
    }
}
