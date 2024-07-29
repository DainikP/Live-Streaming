import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

function Viewing() {
    const videoRef = useRef(null);
    const mediaSourceRef = useRef(new MediaSource());
    const sourceBufferRef = useRef(null);

    useEffect(() => {
        const mediaSource = mediaSourceRef.current;
        const video = videoRef.current;

        if (video) {
            video.src = URL.createObjectURL(mediaSource);
        }

        const handleSourceOpen = () => {
            sourceBufferRef.current = mediaSource.addSourceBuffer('video/webm; codecs="vp8, vorbis"');
            sourceBufferRef.current.addEventListener('updateend', () => {
                // Handle buffer updates and end of stream
                if (sourceBufferRef.current.buffered.length > 0 && mediaSource.readyState === 'open') {
                    if (sourceBufferRef.current.buffered.end(0) >= video.duration) {
                        mediaSource.endOfStream();
                    }
                }
            });
        };

        mediaSource.addEventListener('sourceopen', handleSourceOpen);

        const handleStream = (data) => {
            const sourceBuffer = sourceBufferRef.current;

            if (sourceBuffer && !sourceBuffer.updating) {
                sourceBuffer.appendBuffer(data);
            }
        };

        
        socket.on('start-stream', (data) => {
            // Ensure the data is in ArrayBuffer format
            const arrayBuffer = new Uint8Array(data).buffer;
            handleStream(arrayBuffer);
        });

        return () => {
            socket.off('start-stream');
            if (mediaSource.readyState === 'open') {
                mediaSource.endOfStream();
            }
            mediaSource.removeEventListener('sourceopen', handleSourceOpen);
        };
    }, []);



    return (
        <div className="Viewing">
            <h1>Viewing</h1>
            <video ref={videoRef} autoPlay controls style={{ width: '100%', maxWidth: '600px' }} />
        </div>
    );
}

export default Viewing;
