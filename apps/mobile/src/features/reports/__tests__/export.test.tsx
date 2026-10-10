import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ExportMenu } from '../components';
import { exportFileName } from '../lib/export';

const mockWrites: Record<string, string> = {};
const { shareAsync } = jest.requireMock<{ shareAsync: jest.Mock }>('expo-sharing');

jest.mock('expo-file-system', () => ({
  Paths: { cache: 'file:///cache' },
  File: class {
    uri: string;
    name: string;
    exists = false;
    size = 128;
    constructor(directory: string, name: string) {
      this.name = name;
      this.uri = `${directory}/${name}`;
    }
    write(content: string) {
      mockWrites[this.name] = content;
    }
    delete() {}
  },
}));

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(async () => ({ uri: 'file:///print.pdf', base64: 'JVBERi0=' })),
}));

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: () => ({ navigate: jest.fn(), back: jest.fn(), canGoBack: () => true }),
}));

describe('Exportar relatório', () => {
  it('names the file after the month', () => {
    expect(exportFileName('2026-09', 'pdf')).toBe('guara-relatorio-setembro-2026.pdf');
    expect(exportFileName('2026-10', 'xlsx')).toBe('guara-relatorio-outubro-2026.xlsx');
  });

  it('generates the CSV, sends a copy and offers the file to save', async () => {
    render(<ExportMenu />);
    fireEvent.press(screen.getByRole('button', { name: 'Exportar relatório' }));
    expect(screen.getByText('1 a 23 de setembro')).toBeOnTheScreen();
    expect(screen.getByText(/^Nubank e Itaú · \d+ lançamentos$/)).toBeOnTheScreen();
    expect(screen.getByRole('switch', { name: 'Enviar também por e-mail' })).toBeChecked();

    fireEvent.press(screen.getByRole('radio', { name: 'CSV' }));
    fireEvent.press(screen.getByRole('button', { name: 'Gerar arquivo' }));

    expect(await screen.findByText('guara-relatorio-setembro-2026.csv')).toBeOnTheScreen();
    expect(screen.getByText('CSV · 1 a 23 de setembro · Nubank e Itaú')).toBeOnTheScreen();
    expect(screen.getByText(/Enviamos uma cópia para/)).toBeOnTheScreen();
    const csv = mockWrites['guara-relatorio-setembro-2026.csv'];
    expect(csv).toContain('Data,Descrição,Categoria,Conta,Valor (R$)');
    expect(csv).toContain('Loja de eletrônicos online,Eletrônicos,Nubank crédito,-1249.90');

    fireEvent.press(screen.getByRole('button', { name: 'Baixar' }));
    await waitFor(() =>
      expect(shareAsync).toHaveBeenCalledWith(
        'file:///cache/guara-relatorio-setembro-2026.csv',
        expect.objectContaining({ mimeType: 'text/csv' }),
      ),
    );
  });

  it('without the e-mail copy, only the file is ready', async () => {
    render(<ExportMenu />);
    fireEvent.press(screen.getByRole('button', { name: 'Exportar relatório' }));
    fireEvent.press(screen.getByRole('switch', { name: 'Enviar também por e-mail' }));
    fireEvent.press(screen.getByRole('button', { name: 'Gerar arquivo' }));
    expect(await screen.findByText('guara-relatorio-setembro-2026.pdf')).toBeOnTheScreen();
    expect(screen.getByText('O arquivo está pronto para salvar ou enviar.')).toBeOnTheScreen();
  });
});
