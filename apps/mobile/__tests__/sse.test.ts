import { createSSEParser, type SSEMessage } from '@/lib/sse';

function parse(chunks: string[]): SSEMessage[] {
  const messages: SSEMessage[] = [];
  const parser = createSSEParser((message) => messages.push(message));
  chunks.forEach((chunk) => parser.feed(chunk));
  parser.end();
  return messages;
}

describe('createSSEParser', () => {
  it('parses events split across arbitrary chunks', () => {
    expect(parse(['event: delta\nda', 'ta: {"text":"Olá"}\n', '\nid: 2\ndata: fim\n\n'])).toEqual([
      { event: 'delta', data: '{"text":"Olá"}', id: undefined },
      { event: 'message', data: 'fim', id: '2' },
    ]);
  });

  it('joins multi-line data, ignores comments and handles CRLF', () => {
    expect(parse([': keep-alive\r\ndata: a\r\ndata: b\r\n\r\n'])).toEqual([
      { event: 'message', data: 'a\nb', id: undefined },
    ]);
  });

  it('flushes a trailing event without a blank line', () => {
    expect(parse(['data: last'])).toEqual([{ event: 'message', data: 'last', id: undefined }]);
  });
});
