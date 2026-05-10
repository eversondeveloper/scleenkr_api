import { CriarFuncionario } from './create.funcionario';
import { InMemoryFuncionarioRepository } from '../../infra/repository/in.memory.funcionario.repository';
import { InMemoryFuncionarioCache } from '../../infra/cache/in.memory.funcionario.cache';
import { FuncionarioModelCache } from '../../infra/cache/funcionario.model.cache';

describe('CriarFuncionario', () => {
  it('deve criar funcionário com sucesso', async () => {
    const repository = new InMemoryFuncionarioRepository();
    const cache = new InMemoryFuncionarioCache();
    const usecase = new CriarFuncionario(cache, repository);

    const dadosCache: FuncionarioModelCache = {
      email: 'novo@empresa.com',
      cpf: '98765432100',
      cargo: 'atendente',
      empresaID: 'empresa-123',
      atividade: false
    };
    await cache.set(dadosCache);

    const input = {
      nome: 'Novo Funcionário',
      telefone: '11988887777',
      cpf: '98765432100'
    };

    const result = await usecase.run(input);

    console.log('Output do usecase:', result);

    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
    expect(result.nome).toBe('Novo Funcionário');
    expect(result.telefone).toBe('11988887777');
    expect(result.ativo).toBe(true);
    expect(result.cargo).toBe('atendente');

  });

  it('deve lançar erro quando convite expirado ou inválido', async () => {
    const repository = new InMemoryFuncionarioRepository();
    const cache = new InMemoryFuncionarioCache();
    const usecase = new CriarFuncionario(cache, repository);

    const input = {
      nome: 'Novo Funcionário',
      telefone: '11988887777',
      cpf: '98765432100'
    };

    await expect(usecase.run(input)).rejects.toThrow('convite expirado ou inválido');
  });
});
