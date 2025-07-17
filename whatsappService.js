const axios = require('axios');
require('dotenv').config();

class WhatsAppService {
  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL;
    this.token = process.env.WHATSAPP_TOKEN;
  }

  async enviarMensagem(numero, texto, retornarResposta = false) {
    try {
      const payload = {
        numbers: [`${numero}@s.whatsapp.net`],
        type: 'text',
        delay: 0,
        text: texto
      };

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': this.token
        }
      });

      console.log(`✅ Mensagem enviada para ${numero}:`, response.data);
      if (retornarResposta) {
        return response.data;
      }
      return true;
    } catch (error) {
      console.error(`❌ Erro ao enviar mensagem para ${numero}:`, error.message);
      if (retornarResposta) {
        return null;
      }
      return false;
    }
  }
}

module.exports = new WhatsAppService();
