const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');
const cors = require('cors');
const path = require('path');

// Optionally set the path to ffmpeg if it's not globally accessible
// ffmpeg.setFfmpegPath('/path/to/ffmpeg'); // Update this path if needed

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000', // Adjust as needed
        methods: ['GET', 'POST']
    }
});

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New client connected');

    let stream = new PassThrough();
    let ffmpegStream = null;

    socket.on('start-stream', (chunk) => {
        console.log('Received new chunk of data');

        // Create a PassThrough stream for incoming video chunks
        const inputStream = new PassThrough();
        inputStream.write(chunk);
        inputStream.end();

        if (!ffmpegStream) {
            console.log('Starting ffmpeg processing');
            ffmpegStream = ffmpeg(inputStream)
                .inputFormat('flv')
                .videoCodec('libx264')
                .audioCodec('aac')
                .format('flv')
                .on('end', () => {
                    console.log('Stream processing finished');
                })
                .on('error', (err) => {
                    console.error('FFmpeg error:', err);
                })
                .pipe(stream, { end: false });

            // Broadcast the processed stream to all connected clients
            stream.on('data', (data) => {
                console.log('Broadcasting data to clients');
                io.emit('stream', data);
            });
        } else {
            // If ffmpegStream is already processing, just pass data through
            inputStream.pipe(ffmpegStream, { end: false });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        // Cleanup when the client disconnects
        if (ffmpegStream) {
            ffmpegStream.end(); // End the ffmpeg stream
        }
        stream.end(); // End the PassThrough stream
    });
});

server.listen(4000, () => console.log('Server running on port 4000'));
