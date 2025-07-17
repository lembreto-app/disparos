const pool = require('./database');
const whatsappService = require('./whatsappService');

class AgendamentoService {
  async verificarAgendamentos() {
    try {
      const query = `
        SELECT 
          usuarios_guid,
          agendado_para,
          assunto
        FROM agendamentos
        WHERE status = false
      `;
      
      const result = await pool.query(query);
      console.log(`🔍 Verificando agendamentos... ${result.rows.length} encontrado(s)`);
      
      const agora = Date.now();
      
      for (const agendamento of result.rows) {
        const agendadoParaMs = parseInt(agendamento.agendado_para);
        const segundosRestantes = Math.floor((agendadoParaMs - agora) / 1000);
        
        console.log(`⏰ Agendamento ${agendamento.usuarios_guid}: ${segundosRestantes} segundos restantes`);
        
        if (agendadoParaMs <= agora) {
          console.log(`🚀 Processando agendamento que já deveria ter sido enviado`);
          await this.processarAgendamento(agendamento);
        } else {
          console.log(`⏳ Ainda não é hora de enviar para guid: ${agendamento.usuarios_guid}`);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar agendamentos:', error);
    }
  }

  async processarAgendamento(agendamento) {
    try {
      const { usuarios_guid, assunto } = agendamento;
      
      // Buscar o número do WhatsApp na tabela usuarios usando a coluna guid
      const userQuery = 'SELECT whatsapp FROM usuarios WHERE guid = $1';
      const userResult = await pool.query(userQuery, [usuarios_guid]);
      
      if (userResult.rows.length === 0) {
        console.log(`❌ Usuário não encontrado para guid: ${usuarios_guid}`);
        return;
      }
      
      const whatsapp = userResult.rows[0].whatsapp;
      console.log(`📤 Processando agendamento para guid: ${usuarios_guid} - WhatsApp: ${whatsapp}`);
      
      // Montar mensagem no formato solicitado
      const texto = `> Lembrete\n\n${assunto}\n\n----\n✅ - Enviada`;

      // Enviar mensagem e aguardar o retorno da API
      const response = await whatsappService.enviarMensagem(whatsapp, texto, true); // true = retorna o response

      // Só marcar como enviado se houver folder_id no retorno
      if (response && response.folder_id) {
        await this.marcarComoEnviado(usuarios_guid, agendamento.agendado_para);
        console.log(`✅ Agendamento processado com sucesso - GUID: ${usuarios_guid} - WhatsApp: ${whatsapp}`);
      } else {
        console.log(`❌ Falha ao processar agendamento - GUID: ${usuarios_guid} - WhatsApp: ${whatsapp}`);
      }
    } catch (error) {
      console.error('❌ Erro ao processar agendamento:', error);
    }
  }

  async marcarComoEnviado(usuarios_guid, agendado_para) {
    try {
      const query = 'UPDATE agendamentos SET status = true WHERE usuarios_guid = $1 AND agendado_para = $2';
      await pool.query(query, [usuarios_guid, agendado_para]);
    } catch (error) {
      console.error('❌ Erro ao marcar agendamento como enviado:', error);
    }
  }

  calcularSegundosRestantes(agendadoPara) {
    const agora = Date.now();
    const agendadoParaMs = parseInt(agendadoPara);
    const diferenca = agendadoParaMs - agora;
    return Math.max(0, Math.floor(diferenca / 1000));
  }
}

module.exports = new AgendamentoService();

