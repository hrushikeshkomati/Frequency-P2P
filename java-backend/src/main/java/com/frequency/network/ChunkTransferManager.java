package com.frequency.network;

import java.io.*;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * High-Speed Multithreaded Chunk Transfer Manager
 */
public class ChunkTransferManager {
    public static final int LAN_CHUNK_SIZE = 65536; // 64 KB
    public static final int BLE_CHUNK_SIZE = 512;   // 512 Bytes BLE 5.2 MTU

    private final AdaptiveMultiplexer multiplexer;
    private final AtomicInteger completedChunks = new AtomicInteger(0);

    public ChunkTransferManager(AdaptiveMultiplexer multiplexer) {
        this.multiplexer = multiplexer;
    }

    public void dispatchFile(File file, ProgressListener listener) throws Exception {
        long totalBytes = file.length();
        int chunkCount = (int) Math.ceil((double) totalBytes / LAN_CHUNK_SIZE);
        completedChunks.set(0);

        MessageDigest fullFileDigest = MessageDigest.getInstance("SHA-256");

        try (FileInputStream fis = new FileInputStream(file)) {
            byte[] buffer = new byte[LAN_CHUNK_SIZE];
            int readBytes;
            int chunkIndex = 0;

            while ((readBytes = fis.read(buffer)) != -1) {
                byte[] chunk = Arrays.copyOf(buffer, readBytes);
                fullFileDigest.update(chunk);

                final int currentIndex = chunkIndex;
                multiplexer.routeChunk(chunk, currentIndex, new AdaptiveMultiplexer.ChunkCallback() {
                    @Override
                    public void onSuccess(int index, String transport) {
                        int done = completedChunks.incrementAndGet();
                        listener.onProgress(done, chunkCount, transport);
                    }

                    @Override
                    public void onFailure(int index, Throwable cause) {
                        listener.onError(index, cause);
                    }
                });
                chunkIndex++;
            }
        }
    }

    public interface ProgressListener {
        void onProgress(int completed, int total, String transport);
        void onError(int chunkIndex, Throwable error);
    }
}
