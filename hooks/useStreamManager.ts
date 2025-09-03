
import { useState, useCallback } from 'react';
import { Stream } from '../types';

export const useStreamManager = (initialStreams: Stream[]) => {
    const [history, setHistory] = useState<Stream[][]>([initialStreams]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const streams = history[historyIndex];

    const updateStreamsHistory = useCallback((newStreams: Stream[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, newStreams]);
        setHistoryIndex(newHistory.length);
    }, [history, historyIndex]);

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    const handleUndo = useCallback(() => {
        if (canUndo) {
            setHistoryIndex(prevIndex => prevIndex - 1);
        }
    }, [canUndo]);

    const handleRedo = useCallback(() => {
        if (canRedo) {
            setHistoryIndex(prevIndex => prevIndex + 1);
        }
    }, [canRedo]);

    const saveStream = useCallback((stream: Stream) => {
        const currentStreams = history[historyIndex];
        const exists = currentStreams.some(s => s.id === stream.id);
        let newStreams;
        if (exists) {
            newStreams = currentStreams.map(s => s.id === stream.id ? stream : s);
        } else {
            newStreams = [...currentStreams, stream];
        }
        updateStreamsHistory(newStreams);
    }, [history, historyIndex, updateStreamsHistory]);

    const deleteStream = useCallback((streamId: string) => {
        const currentStreams = history[historyIndex];
        const newStreams = currentStreams.filter(s => s.id !== streamId);
        updateStreamsHistory(newStreams);
    }, [history, historyIndex, updateStreamsHistory]);
    
    const setStreams = useCallback((newStreams: Stream[]) => {
        updateStreamsHistory(newStreams);
    }, [updateStreamsHistory]);

    return {
        streams,
        setStreams,
        saveStream,
        deleteStream,
        handleUndo,
        handleRedo,
        canUndo,
        canRedo,
    };
};
