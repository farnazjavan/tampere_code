import React, { useState } from 'react';
import io from 'socket.io-client';
import { Button, TextField, Typography, Box } from '@mui/material';

const socket = io('http://localhost:5000'); // Ensure this matches your server address

function App() {
  const [summary, setSummary] = useState("");

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = (e) => {
        const content = e.target.result;
        socket.emit('uploadPDF', content);
      };
    }
  };

  socket.on('summaryResult', (data) => {
    setSummary(data[0]);
  });

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        PDF Summarizer
      </Typography>
      <Button
        variant="contained"
        component="label">
        Upload PDF
        <input
          type="file"
          hidden
          onChange={handleFileUpload}
          accept=".pdf"
        />
      </Button>
      <TextField
        label="Summary"
        multiline
        fullWidth
        variant="outlined"
        margin="normal"
        value={summary}
      />
    </Box>
  );
}

export default App;
