const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Твои ключи Supabase
const supabase = createClient(
  'https://opqqchrgkkirzgvkzojf.supabase.co',
  'sb_publishable_Hfr4I7BM8lcOMCwvRFbsNg_ze_1xxWo'
);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', async (socket) => {
  // Загружаем старые сообщения
  const { data: history } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true });

  if (history) socket.emit('history', history);

  // Новое сообщение — сохраняем и рассылаем
  socket.on('message', async (msg) => {
    await supabase.from('messages').insert({ text: msg });
    io.emit('message', msg);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('Сервер запущен на порту ' + PORT);
});