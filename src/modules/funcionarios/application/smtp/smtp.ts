import { SMTPFuncionarioDTO } from "../../infra/smtp/smtp.funcionario.model";

export interface SMTPServer {
    enviar(dados: SMTPFuncionarioDTO): Promise<void>;
}
