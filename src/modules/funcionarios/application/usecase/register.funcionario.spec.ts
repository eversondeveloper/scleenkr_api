import { RegistrarFuncionario } from './register.funcionario';
import { InMemoryFuncionarioRepository } from '../../infra/repository/in.memory.funcionario.repository';
import { InMemoryFuncionarioCache } from '../../infra/cache/in.memory.funcionario.cache';
import { StubSMTPFuncionarioServer } from '../../infra/smtp/stub.smtp.funcionario';
import { Funcionario } from '../../domain/entity/funcionario';

describe('RegistrarFuncionario', () => {
  it('deve registrar novo funcionário com sucesso', async () => {
    const repository = new InMemoryFuncionarioRepository();
    const cache = new InMemoryFuncionarioCache();
    const smtp = new StubSMTPFuncionarioServer();
    const usecase = new RegistrarFuncionario(cache, smtp, repository);

    const gestor = Funcionario.criar(
      'empresa-123',
      'Gestor Teste',
      'gestor@empresa.com',
      '11999999999',
      '12345678901',
      true,
      'gerente'
    );
    await repository.criar(gestor);

    const input = {
      funcionarioID: gestor.buscarPropriedades().id,
      email: 'novo@empresa.com',
      cpf: '98765432100',
      cargo: 'atendente'
    };

    await usecase.run(input);

    const cachedData = await cache.get('98765432100');
    expect(cachedData).toBeDefined();
    expect(cachedData?.email).toBe('novo@empresa.com');
    expect(cachedData?.cargo).toBe('atendente');
  });

  it('deve lançar erro quando email do novo funcionário é inválido', async () => {
    const repository = new InMemoryFuncionarioRepository();
    const cache = new InMemoryFuncionarioCache();
    const smtp = new StubSMTPFuncionarioServer();
    const usecase = new RegistrarFuncionario(cache, smtp, repository);

    const gestor = Funcionario.criar(
      'empresa-123',
      'Gestor Teste',
      'gestor@empresa.com',
      '11999999999',
      '12345678901',
      true,
      'gerente'
    );
    await repository.criar(gestor);

    const input = {
      funcionarioID: gestor.buscarPropriedades().id,
      email: 'email-invalido',
      cpf: '98765432100',
      cargo: 'atendente'
    };

    await expect(usecase.run(input)).rejects.toThrow();
  });

  it('deve lançar erro quando cargo não existe', async () => {
    const repository = new InMemoryFuncionarioRepository();
    const cache = new InMemoryFuncionarioCache();
    const smtp = new StubSMTPFuncionarioServer();
    const usecase = new RegistrarFuncionario(cache, smtp, repository);

    const gestor = Funcionario.criar(
      'empresa-123',
      'Gestor Teste',
      'gestor@empresa.com',
      '11999999999',
      '12345678901',
      true,
      'gerente'
    );
    await repository.criar(gestor);

    const input = {
      funcionarioID: gestor.buscarPropriedades().id,
      email: 'novo@empresa.com',
      cpf: '98765432100',
      cargo: 'cargo-inexistente'
    };

    await expect(usecase.run(input)).rejects.toThrow();
  });
});
