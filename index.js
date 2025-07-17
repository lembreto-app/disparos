const agendamentoService = require('./agendamentoService');
require('dotenv').config();

class LembretoDisparos {
  constructor() {
    this.intervalo = parseInt(process.env.CHECK_INTERVAL) || 5000;
    this.executando = false;
  }

  async iniciar() {
    console.log('🚀 Iniciando sistema de disparos de lembretes...');
    console.log(`⏰ Verificando agendamentos a cada ${this.intervalo/1000} segundos`);
    
    this.executando = true;
    
    // Primeira verificação imediata
    await agendamentoService.verificarAgendamentos();
    
    // Configurar verificação periódica
    setInterval(async () => {
      if (this.executando) {
        await agendamentoService.verificarAgendamentos();
      }
    }, this.intervalo);
  }

  parar() {
    console.log('🛑 Parando sistema de disparos...');
    this.executando = false;
  }
}

// Inicializar aplicação
const app = new LembretoDisparos();

// Tratamento de sinais para parada graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Recebido SIGINT, parando aplicação...');
  app.parar();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recebido SIGTERM, parando aplicação...');
  app.parar();
  process.exit(0);
});

// Iniciar aplicação
app.iniciar().catch(error => {
  console.error('❌ Erro ao iniciar aplicação:', error);
  process.exit(1);
});
