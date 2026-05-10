import { CriarDono } from './create.dono';
import { InMemoryEmpresaGateway } from '../../infra/gateway/in.memory.empresa.gateway';

describe('CriarDono', () => {
  it('deve criar dono com sucesso', async () => {
    const gateway = new InMemoryEmpresaGateway();
    const usecase = new CriarDono(gateway);

    const input = {
      empresaID: 'empresa-123',
      nome: 'João Dono',
      email: 'joao@empresa.com',
      telefone: '11988887777',
      cpf: '12345678900'
    };

    const result = await usecase.run(input);

    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
    expect(result.ID).toBeDefined();
    expect(typeof result.ID).toBe('string');
  });

  it('deve lançar erro quando nome inválido', async () => {
    const gateway = new InMemoryEmpresaGateway();
    const usecase = new CriarDono(gateway);

    const input = {
      empresaID: 'empresa-123',
      nome: 'Jo', // nome muito curto
      email: 'joao@empresa.com',
      telefone: '11988887777',
      cpf: '12345678900'
    };

    await expect(usecase.run(input)).rejects.toThrow('seu nome deve ter mais de 4 caracteres');
  });

  it('deve lançar erro quando email inválido', async () => {
    const gateway = new InMemoryEmpresaGateway();
    const usecase = new CriarDono(gateway);

    const input = {
      empresaID: 'empresa-123',
      nome: 'João Dono',
      email: 'email-invalido',
      telefone: '11988887777',
      cpf: '12345678900'
    };

    await expect(usecase.run(input)).rejects.toThrow();
  });

  it('deve lançar erro quando cpf inválido', async () => {
    const gateway = new InMemoryEmpresaGateway();
    const usecase = new CriarDono(gateway);

    const input = {
      empresaID: 'empresa-123',
      nome: 'João Dono',
      email: 'joao@empresa.com',
      telefone: '11988887777',
      cpf: '123'
    };

    await expect(usecase.run(input)).rejects.toThrow();
  });
});
