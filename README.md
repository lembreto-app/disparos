# Lembreto Disparos

Sistema de disparos automáticos de WhatsApp baseado em agendamentos.

## Instalação

```bash
npm install
```

## Configuração

1. Configure o arquivo `.env` com suas credenciais
2. Certifique-se que as tabelas `agendamentos` e `usuarios` existem no banco

## Estrutura das Tabelas

### agendamentos
- id
- agendado_para (timestamp em milissegundos)
- created_at
- assunto
- texto
- usuario_id
- enviado (boolean)
- enviado_em

### usuarios
- id
- whatsapp

## Execução

```bash
npm start
```

Para desenvolvimento:
```bash
npm run dev
```
