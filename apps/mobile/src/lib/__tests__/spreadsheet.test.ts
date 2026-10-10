import { cents } from '@guara/utils';
import { strFromU8, unzipSync } from 'fflate';

import { buildCsv, buildXlsx, centsToDecimalText } from '../spreadsheet';

describe('spreadsheet', () => {
  it('writes cents as exact decimals', () => {
    expect(centsToDecimalText(cents(124_990))).toBe('1249.90');
    expect(centsToDecimalText(cents(-5))).toBe('-0.05');
    expect(centsToDecimalText(cents(0))).toBe('0.00');
  });

  it('builds a workbook with one tab per sheet', () => {
    const files = unzipSync(
      buildXlsx([
        { name: 'Resumo', rows: [['Entrou (R$)', { cents: cents(820_000) }]] },
        {
          name: 'Lançamentos',
          rows: [
            ['Data', 'Descrição'],
            ['23/09/2026', 'Café & pão'],
          ],
        },
      ]),
    );
    expect(Object.keys(files)).toEqual(
      expect.arrayContaining([
        '[Content_Types].xml',
        'xl/workbook.xml',
        'xl/worksheets/sheet1.xml',
        'xl/worksheets/sheet2.xml',
        'xl/styles.xml',
      ]),
    );
    const workbook = strFromU8(files['xl/workbook.xml']!);
    expect(workbook).toContain('name="Resumo"');
    expect(workbook).toContain('name="Lançamentos"');
    expect(strFromU8(files['xl/worksheets/sheet1.xml']!)).toContain(
      '<c r="B1" s="1"><v>8200.00</v>',
    );
    expect(strFromU8(files['xl/worksheets/sheet2.xml']!)).toContain('Café &amp; pão');
  });

  it('builds RFC 4180 CSV', () => {
    expect(
      buildCsv([
        ['Data', 'Descrição', 'Valor (R$)'],
        ['23/09/2026', 'Mercado, padaria e "café"', { cents: cents(-1_250) }],
      ]),
    ).toBe('Data,Descrição,Valor (R$)\r\n23/09/2026,"Mercado, padaria e ""café""",-12.50');
  });
});
