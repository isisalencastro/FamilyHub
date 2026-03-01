import { expect, test, describe } from 'vitest';
import { useFamilyFinanceStore } from './familyFinanceStore';

describe('familyFinanceStore tests', () => {
    test('deve possuir valores iniciais configurados (Estado Inicial)', () => {
        const state = useFamilyFinanceStore.getState();
        expect(state.renda.salarios.length).toBeGreaterThan(0);
        expect(state.fixoMensal.length).toBeGreaterThan(0);
    });

    test('deve permitir adicionar e remover um novo custo fixo', () => {
        const store = useFamilyFinanceStore.getState();
        const numeroInicialDeFixos = store.fixoMensal.length;

        // Adiciona o Custo
        store.addFixo({ name: 'Nova Despesa de Teste', value: 100 });

        let novoState = useFamilyFinanceStore.getState();
        expect(novoState.fixoMensal.length).toBe(numeroInicialDeFixos + 1);

        const despesaAdicionada = novoState.fixoMensal.find((item) => item.name === 'Nova Despesa de Teste');
        expect(despesaAdicionada).toBeDefined();
        expect(despesaAdicionada?.value).toBe(100);
        expect(despesaAdicionada?.paid).toBe(false);

        // Remove o custo (Limpeza)
        if (despesaAdicionada) {
            novoState.removeFixo(despesaAdicionada.id);
        }
        novoState = useFamilyFinanceStore.getState();
        expect(novoState.fixoMensal.length).toBe(numeroInicialDeFixos);
    });
});
