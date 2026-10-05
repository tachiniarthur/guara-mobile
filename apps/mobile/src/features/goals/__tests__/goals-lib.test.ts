import { GOAL_EXTRAS, GOALS, GOALS_TODAY } from '../data';
import {
  heroCaption,
  historyNote,
  horizonText,
  listNote,
  nextDeposit,
  paceBadge,
  plannedDeposits,
  progressPercent,
  suggestionText,
  targetText,
} from '../lib/goals';

const [reserva, japao, aposentadoria] = GOALS as [
  (typeof GOALS)[number],
  (typeof GOALS)[number],
  (typeof GOALS)[number],
];

describe('goals', () => {
  it('derives the list header and the cards from the goals', () => {
    expect(plannedDeposits(GOALS)).toEqual({ total: 230_000, without: ['aposentadoria'] });
    expect(GOALS.map(progressPercent)).toEqual([53, 13, 0]);
    expect(paceBadge(reserva, GOALS_TODAY)).toEqual({ label: 'No ritmo', tone: 'positive' });
    expect(paceBadge(japao, GOALS_TODAY)).toEqual({ label: 'Começa em 5/10', tone: 'info' });
    expect(paceBadge(aposentadoria, GOALS_TODAY).label).toBe('Acima do que sobra');
    expect(GOALS.map(horizonText)).toEqual([
      'previsão set/2027',
      'abril de 2028',
      '2051 · aos 55 anos',
    ]);
    expect(targetText(aposentadoria.target)).toBe('R$ 3,0 milhões');
  });

  it('writes the Onça notes from the data', () => {
    expect(nextDeposit(reserva, GOALS_TODAY)).toBe('2026-10-05');
    expect(listNote(GOALS, GOALS_TODAY)).toBe(
      'A reserva está no ritmo: mais R$ 990 em 5/10 e você passa de 56%. A viagem começa no mesmo dia. A aposentadoria pede mais do que sobra hoje; quer ver onde ajustar?',
    );
    const extras = GOAL_EXTRAS.reserva!;
    expect(suggestionText(reserva, extras.suggestion!)).toBe(
      'Se você mandar os R$ 312 do corte no transporte por app para cá, a reserva fica pronta em jul/2027, 2 meses antes.',
    );
    expect(historyNote(extras.history, extras.movements)).toBe(
      'Junho caiu por um resgate de R$ 1.200 para o conserto do carro. É para isso que a reserva existe.',
    );
  });

  it('summarizes what is left of a goal', () => {
    expect(heroCaption(reserva)).toEqual({
      percent: 53,
      missing: 'R$ 14.108',
      deposit: 'R$ 990/mês',
      completion: 'set/2027',
    });
  });
});
