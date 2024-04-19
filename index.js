const express = require('express');
    const http = require('http');
    const cors = require('cors');
    const socketIo = require('socket.io');
    const { parseBuffer } = require('pdf-parse');
    const axios = require('axios');
    require('dotenv').config();

    const app = express();
    const server = http.createServer(app);
    const io = socketIo(server, {
      cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"]
      }
    });

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    app.use(cors());

    const getSummaryFromOpenAI = async (text) => {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/engines/davinci-codex/completions',
          {
            prompt: "Summarize this text: " + text,
            max_tokens: 150
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data.choices[0].text.trim();
      } catch (error) {
        console.error('Failed to fetch summary from OpenAI:', error);
        return "Error in summarization";
      }
    };

    io.on('connection', (socket) => {
      console.log('Connected:', socket.id);

      socket.on('uploadPDF', async (data) => {
        const buffer = Buffer.from(data);
        const doc = await parseBuffer(buffer);
        const text = doc.text;

        const summary = await getSummaryFromOpenAI(text);
        socket.emit('summaryResult', [summary]);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected:', socket.id);
      });
    });

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });