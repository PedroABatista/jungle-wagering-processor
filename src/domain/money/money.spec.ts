import { describe, it, expect } from 'bun:test';
import { Money } from './money';

describe('Money', () => {
  describe('from', () => {
    it('deve aceitar 25.00 BRL', () => {
      const money = Money.from({ amount: '25.00', currency: 'BRL' });
      expect(money.toJSON()).toEqual({ amount: '25.00', currency: 'BRL' });
    });

    it('deve aceitar 25 e normalizar para 25.00', () => {
      const money = Money.from({ amount: '25', currency: 'BRL' });
      expect(money.toJSON()).toEqual({ amount: '25.00', currency: 'BRL' });
    });

    it('deve normalizar currency em caixa alta e sem espaços', () => {
      const money = Money.from({ amount: '10.00', currency: ' brl ' });
      expect(money.toJSON()).toEqual({ amount: '10.00', currency: 'BRL' });
    });

    it('deve rejeitar mais de 2 casas decimais', () => {
      expect(() => {
        Money.from({ amount: '25.123', currency: 'BRL' });
      }).toThrow('Invalid amount format');
    });

    it('deve rejeitar notação científica', () => {
      expect(() => {
        Money.from({ amount: '1e5', currency: 'BRL' });
      }).toThrow('Invalid amount format');
    });

    it('deve rejeitar amount vazio', () => {
      expect(() => {
        Money.from({ amount: '', currency: 'BRL' });
      }).toThrow('Amount cannot be empty');
    });

    it('deve rejeitar currency vazia', () => {
      expect(() => {
        Money.from({ amount: '10.00', currency: '' });
      }).toThrow('Currency cannot be empty');
    });
  });

  describe('operações', () => {
    it('deve somar dois Money corretamente', () => {
      const m1 = Money.from({ amount: '10.00', currency: 'BRL' });
      const m2 = Money.from({ amount: '5.50', currency: 'BRL' });
      expect(m1.add(m2).toJSON().amount).toBe('15.50');
    });

    it('deve subtrair dois Money corretamente', () => {
      const m1 = Money.from({ amount: '10.00', currency: 'BRL' });
      const m2 = Money.from({ amount: '5.50', currency: 'BRL' });
      expect(m1.subtract(m2).toJSON().amount).toBe('4.50');
    });

    it('deve inverter o valor (negate)', () => {
      const m1 = Money.from({ amount: '10.00', currency: 'BRL' });
      expect(m1.negate().toJSON().amount).toBe('-10.00');
    });

    it('deve lançar erro ao somar moedas diferentes', () => {
      const brl = Money.from({ amount: '10.00', currency: 'BRL' });
      const usd = Money.from({ amount: '5.00', currency: 'USD' });
      expect(() => brl.add(usd)).toThrow('Currency mismatch');
    });
  });

  describe('comparações', () => {
    it('deve verificar se um valor é menor', () => {
      const menor = Money.from({ amount: '10.00', currency: 'BRL' });
      const maior = Money.from({ amount: '20.00', currency: 'BRL' });
      expect(menor.isLessThan(maior)).toBe(true);
      expect(maior.isLessThan(menor)).toBe(false);
    });

    it('deve verificar se dois valores são iguais', () => {
      const m1 = Money.from({ amount: '10.00', currency: 'BRL' });
      const m2 = Money.from({ amount: '10.00', currency: 'BRL' });
      expect(m1.equals(m2)).toBe(true);
    });
  });
});