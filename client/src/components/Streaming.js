import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

function Streaming() {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);

    useEffect(() => {
        // Capture video from the user's camera
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                // Initialize MediaRecorder to record the stream
                const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp8' });
                mediaRecorderRef.current = mediaRecorder;

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        // Send video data to the server
                        socket.emit('start-stream', event.data);
                    }
                };

                mediaRecorder.start(1000); // Send data in chunks every 1 second
            })
            .catch(err => console.error(err));

        return () => {
            // Cleanup
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    return (
        <div className="Streaming">
            <h1>Streaming</h1>
            <video ref={videoRef} autoPlay style={{ width: '100%', maxWidth: '600px' }} />
        </div>
    );
}

export default Streaming;
