import {
    Request,
    Response,
    NextFunction
} from 'express'
import { ManipuladorDeErro } from '@/shared/errors/error.handler'

export function erroMiddleware(
  erro: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const resposta = ManipuladorDeErro.http(erro);

  return res.status(resposta.status).json({
    erro: resposta.mensagem
  });
}