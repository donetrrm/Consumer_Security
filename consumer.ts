import amqp from 'amqplib'
import dotenv from 'dotenv'

dotenv.config()

async function consumeMessages() {

const options = {
    vhost: process.env.AMQP_VHOST,
    username: process.env.AMQP_USERNAME,
    password: process.env.AMQP_PASSWORD,
    port: process.env.AMQP_PORT,
}

const  url = process.env.AMQP_URL || "";
 const queue = process.env.AMQP_QUEUE || ""

  const connection = await amqp.connect(url, options);
  const channel = await connection.createChannel();

  await channel.assertQueue(queue, { durable: true });

  console.log(`Escuchando mensajes en la cola ${queue}`);

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      try {
        await enviarMensajeALaAPI(msg.content.toString());
        console.log('Mensaje enviado a la API:', msg.content.toString());

        channel.ack(msg);
      } catch (error) {
        console.error('Error al procesar el mensaje:', error);
        channel.reject(msg, false);
      }
    }
  });
}

async function enviarMensajeALaAPI(message: any) {
  const apiUrl = 'http://192.168.100.61/activate';
  const messageJSON = JSON.parse(message);
  console.log(messageJSON);
  const formData = `status=${encodeURIComponent(messageJSON.status)}&id=${encodeURIComponent(messageJSON.id)}&correo=${messageJSON.idPropietario}`; // Agrega los parámetros "status" e "id" a la cadena de consulta

  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  };

  const response = await fetch(apiUrl, requestOptions);
  if (!response.ok) {
    throw new Error(`Error al enviar mensaje a la API: ${response.status} - ${response.statusText}`);
  }
}

consumeMessages().catch(console.error);
