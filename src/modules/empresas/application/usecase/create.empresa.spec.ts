import { CriarEmpresa } from './create.empresa';
import { InMemoryEmpresaRepository } from '../../infra/repository/in.memory.empresa.repository';

describe('CriarEmpresa', () => {
  it('deve criar uma empresa com dados válidos', async () => {
    const repository = new InMemoryEmpresaRepository();
    const usecase = new CriarEmpresa(repository);

    const input = {
      cnpj: '12345678000190',
      razaoSocial: 'Empresa Teste',
      nomeFantasia: 'Teste',
      endereco: 'Rua Teste, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234567',
      telefone: '1133334444',
      email: 'teste@empresa.com',
    };

    const result = await usecase.run(input);

    expect(result.ID).toBeDefined();
    expect(typeof result.ID).toBe('string');
  });

  it('deve lançar erro quando email é inválido', async () => {
    const repository = new InMemoryEmpresaRepository();
    const usecase = new CriarEmpresa(repository);

    const input = {
      cnpj: '12345678000190',
      razaoSocial: 'Empresa Teste',
      nomeFantasia: 'Teste',
      endereco: 'Rua Teste, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234567',
      telefone: '1133334444',
      email: 'email-invalido',
    };

    await expect(usecase.run(input)).rejects.toThrow();
  });

  it('deve lançar erro quando algum campo possui tipo inválido', async () => {
    const repository = new InMemoryEmpresaRepository();
    const usecase = new CriarEmpresa(repository);

    const input = {
      cnpj: 12345678000190,
      razaoSocial: 'Empresa Teste',
      nomeFantasia: 'Teste',
      endereco: 'Rua Teste, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234567',
      telefone: '1133334444',
      email: 'teste@empresa.com',
    };

    await expect(usecase.run(input as any)).rejects.toThrow('cnpj must be a string');
  });
});
