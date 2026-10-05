import { SAVED_SIMULATIONS } from '../../data';
import { filterSimulations, savedCaption, savedSummary, simulationsCountText } from '../saved';

const nbsp = (text: string | null) => text?.replace(/ /g, ' ') ?? null;

describe('saved simulations', () => {
  it('recomputes the design summaries from the saved premises', () => {
    expect(
      SAVED_SIMULATIONS.map((simulation) => {
        const summary = savedSummary(simulation, SAVED_SIMULATIONS);
        return `${nbsp(summary.amount)} · ${nbsp(summary.detail)}`;
      }),
    ).toEqual([
      'R$ 5.640/mês · para R$ 10.000 de renda em 2051',
      'R$ 1.310/mês · R$ 30.000 em abril de 2028',
      'R$ 312/mês · R$ 46 mil em 10 anos',
      'R$ 4.150/mês · mesma renda, 5 anos depois',
    ]);
  });

  it('says when the simulation became a goal', () => {
    expect(SAVED_SIMULATIONS.map(savedCaption)).toEqual([
      'Salva em 23/09/2026',
      'Salva em 23/09/2026 · virou meta',
      'Salva em 20/09/2026',
      'Salva em 12/09/2026',
    ]);
  });

  it('filters by kind and counts', () => {
    expect(filterSimulations(SAVED_SIMULATIONS, 'retirement')).toHaveLength(2);
    expect(filterSimulations(SAVED_SIMULATIONS, 'all')).toHaveLength(4);
    expect(simulationsCountText(1)).toBe('1 simulação');
    expect(simulationsCountText(4)).toBe('4 simulações');
  });
});
