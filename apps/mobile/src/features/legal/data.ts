/** Legal texts as written in the design (version of 1 Sept 2026). */
export interface LegalDocument {
  title: string;
  version: string;
  summary: string;
  sections: { title: string; body: string }[];
  /** The other document, linked at the end. */
  other: { label: string; href: '/terms' | '/privacy' };
}

export const TERMS: LegalDocument = {
  title: 'Termos de uso',
  version: 'Versão de 1º de setembro de 2026',
  summary:
    'Em resumo: o Guará só lê seus dados, você controla as conexões e pode apagar tudo quando quiser.',
  sections: [
    {
      title: '1. O que é o Guará',
      body: 'Um app que organiza suas finanças pessoais a partir dos dados que você autoriza pelo Open Finance e do que você cadastra. O Guará só lê dados: não movimenta dinheiro, não faz pagamentos e não pede a senha do seu banco.',
    },
    {
      title: '2. Sua conta',
      body: 'Você precisa ter 18 anos ou mais e manter seus dados de acesso em segurança. Pode excluir a conta quando quiser em Meu perfil.',
    },
    {
      title: '3. Conexão com bancos',
      body: 'A conexão é feita pelo Malvo, instituição autorizada pelo Banco Central, dentro do Open Finance Brasil. Cada autorização vale por até 12 meses e pode ser revogada no Guará ou no app do banco.',
    },
    {
      title: '4. Assistentes de IA',
      body: 'Os assistentes respondem com base nos seus dados e podem errar. As respostas são informativas e não são recomendação de investimento, consultoria financeira ou jurídica.',
    },
    {
      title: '5. Planos e pagamento',
      body: 'O plano Essencial é gratuito. Os planos Completo e Ampliado são assinaturas mensais ou anuais, renovadas automaticamente até você cancelar. Ao cancelar, o acesso pago vale até o fim do período já pago.',
    },
    {
      title: '6. Limites de responsabilidade',
      body: 'Cotações e dados de mercado vêm de terceiros, com possível atraso. Decisões de investimento são sempre suas.',
    },
    {
      title: '7. Mudanças nestes termos',
      body: 'Avisamos por e-mail e no app com 30 dias de antecedência sempre que algo importante mudar.',
    },
  ],
  other: { label: 'Política de privacidade', href: '/privacy' },
};

export const PRIVACY: LegalDocument = {
  title: 'Política de privacidade',
  version: 'Versão de 1º de setembro de 2026',
  summary:
    'Em resumo: usamos seus dados só para o app funcionar para você. Nada é vendido, e você pode baixar ou apagar tudo.',
  sections: [
    {
      title: 'O que coletamos',
      body: 'Dados de cadastro (nome e e-mail), dados financeiros que você autoriza pelo Open Finance (saldos, lançamentos, cartões e investimentos), o que você cadastra à mão e as conversas com os assistentes.',
    },
    {
      title: 'Para que usamos',
      body: 'Para organizar seus gastos, calcular tetos e metas, acompanhar investimentos, enviar os avisos que você escolheu e responder suas perguntas. Não vendemos seus dados e não usamos para anúncios.',
    },
    {
      title: 'Com quem compartilhamos',
      body: 'Com o Malvo, para a conexão com os bancos; com a Brapi, só o código dos ativos para buscar cotações; e com o provedor de IA, apenas o necessário para responder cada pergunta, sem uso para treinar modelos.',
    },
    {
      title: 'Por quanto tempo guardamos',
      body: 'Enquanto sua conta existir. Arquivos enviados no chat são apagados em 30 dias. Ao excluir a conta, apagamos seus dados em até 30 dias, salvo o que a lei obriga a guardar.',
    },
    {
      title: 'Seus direitos (LGPD)',
      body: 'Você pode acessar, corrigir, baixar e apagar seus dados, além de revogar autorizações, em Meu perfil › Segurança e privacidade, ou pelo e-mail privacidade@guara.app.',
    },
    {
      title: 'Segurança',
      body: 'Dados criptografados em trânsito e armazenados com criptografia. Tokens do Open Finance ficam protegidos e nunca aparecem nos registros.',
    },
  ],
  other: { label: 'Termos de uso', href: '/terms' },
};
