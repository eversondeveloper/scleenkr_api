import { SMTPServer } from "../../application/smtp/smtp";
import { SMTPFuncionarioDTO } from "./smtp.funcionario.model";

export class StubSMTPFuncionarioServer implements SMTPServer {
    async enviar(dados: SMTPFuncionarioDTO): Promise<void> {
        console.log("email enviado com sucesso");
    }
}
