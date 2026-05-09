import { validate, ValidationError } from "class-validator";
import { AppErro, TipoAppErro } from "@/shared/errors/app.error";

function formatarErros(erros: ValidationError[]): string {
    return erros
        .flatMap((erro) => Object.values(erro.constraints ?? {}))
        .join("; ");
}

export async function validarDto(dto: object): Promise<void> {
    const erros = await validate(dto);

    if (erros.length > 0) {
        const mensagem = formatarErros(erros) || "dados de entrada inválidos";
        throw new AppErro(mensagem, TipoAppErro.ENTRADA_INVALIDA);
    }
}
