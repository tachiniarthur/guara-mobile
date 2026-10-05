import { cents, formatCents } from '@guara/utils';

import { PROPERTIES, type RealEstate, type Vehicle } from '../../property-data';
import {
  addMonths,
  fipeChange,
  fipeEntry,
  monthTitle,
  netValue,
  nextReview,
  ownedShare,
  propertiesTotal,
  propertyDetail,
  propertySource,
  realEstateSummary,
  searchFipe,
  shareOfTotal,
  signedPercent,
  valuationRows,
  vehicleSummary,
  wholeReais,
} from '../properties';

const nbsp = (text: string) => text.replace(/ /g, ' ');
const apartment = PROPERTIES[0] as RealEstate;
const car = PROPERTIES[1] as Vehicle;

describe('properties', () => {
  it('derives the apartment numbers of the design', () => {
    expect(nbsp(wholeReais(netValue(apartment)!))).toBe('R$ 405.700');
    expect(ownedShare(apartment)).toBe(65);
    expect(nextReview(apartment)).toBe('2027-02');
    expect(monthTitle(nextReview(apartment)!)).toBe('Fevereiro de 2027');
    expect(realEstateSummary(apartment)).toBe('Imóvel · 72 m² · São Paulo');
    expect(
      valuationRows(apartment).map((row) =>
        [row.label, row.change === null ? null : signedPercent(row.change)].join(' '),
      ),
    ).toEqual(['Estimativa sua +3,3%', 'Estimativa sua +2,6%', 'Cadastro do imóvel ']);
  });

  it('follows the FIPE table for the car', () => {
    const entry = fipeEntry(car.fipeCode)!;
    const month = fipeChange(entry, 1)!;
    expect(nbsp(formatCents(month.amount, { wholeUnits: true, typographicMinus: true }))).toBe(
      '−R$ 630',
    );
    expect(signedPercent(month.percent)).toBe('−0,8%');
    const half = fipeChange(entry, 5)!;
    expect(nbsp(wholeReais(cents(-half.amount)))).toBe('R$ 2.400');
    expect(signedPercent(half.percent)).toBe('−3,0%');
    expect(vehicleSummary(car)).toBe('Veículo · quitado');
  });

  it('writes the lines of the Investimentos card', () => {
    expect(PROPERTIES.map((property) => nbsp(propertyDetail(property)))).toEqual([
      'Imóvel · saldo devedor R$ 214.300',
      'Veículo · quitado',
    ]);
    expect(PROPERTIES.map(propertySource)).toEqual([
      'Valor estimado por você em ago/2026',
      'Tabela FIPE de setembro · −0,8% no mês',
    ]);
  });

  it('computes shares of the net worth', () => {
    const total = cents(4_831_090 + propertiesTotal(PROPERTIES));
    expect(nbsp(formatCents(total))).toBe('R$ 746.810,90');
    expect(shareOfTotal(cents(62_000_000), total)).toBe('83% do total');
    expect(shareOfTotal(cents(7_850_000), total)).toBe('10,5% do total');
  });

  it('searches the FIPE table and adds months', () => {
    expect(searchFipe('onix 2022')).toHaveLength(1);
    expect(searchFipe('Gol')).toHaveLength(0);
    expect(addMonths('2026-11', 3)).toBe('2027-02');
  });
});
