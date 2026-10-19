package com.frequency.ui;

import com.frequency.crypto.NoiseEngine;
import com.frequency.network.AdaptiveMultiplexer;
import com.frequency.network.ChunkTransferManager;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.layout.TilePane;
import javafx.stage.FileChooser;

import java.io.File;
import java.util.logging.Logger;

public class FrequencyController {
    private static final Logger LOGGER = Logger.getLogger(FrequencyController.class.getName());

    @FXML private Label peerStatusLabel;
    @FXML private Label fingerprintLabel;
    @FXML private ProgressBar transferProgressBar;
    @FXML private Label speedLabel;
    @FXML private TextArea messageLogArea;
    @FXML private TextField messageInputField;
    @FXML private TilePane chunkMatrixPane;
    @FXML private CheckBox bleToggle;
    @FXML private CheckBox lanToggle;

    private NoiseEngine noiseEngine;
    private AdaptiveMultiplexer multiplexer;
    private ChunkTransferManager transferManager;

    @FXML
    public void initialize() {
        noiseEngine = new NoiseEngine();
        multiplexer = new AdaptiveMultiplexer(4);
        transferManager = new ChunkTransferManager(multiplexer);

        fingerprintLabel.setText("KEY: " + noiseEngine.getPublicKeyFingerprint());
        peerStatusLabel.setText("MESH READY · NOISE_XX WAITING");
    }

    @FXML
    public void handleSendMessage() {
        String text = messageInputField.getText().trim();
        if (text.isEmpty()) return;

        messageLogArea.appendText("[LOCAL -> REMOTE] " + text + "\n");
        messageInputField.clear();
    }

    @FXML
    public void handleSelectFile() {
        FileChooser chooser = new FileChooser();
        chooser.setTitle("Select File for E2EE P2P Transfer");
        File file = chooser.showOpenDialog(null);
        if (file == null) return;

        new Thread(() -> {
            try {
                transferManager.dispatchFile(file, (completed, total, transport) -> {
                    Platform.runLater(() -> {
                        double pct = (double) completed / total;
                        transferProgressBar.setProgress(pct);
                        speedLabel.setText(String.format("%d / %d chunks (%s)", completed, total, transport));
                    });
                });
            } catch (Exception e) {
                LOGGER.severe("Transfer error: " + e.getMessage());
            }
        }).start();
    }

    @FXML
    public void handleToggleTransports() {
        multiplexer.setBleAvailable(bleToggle.isSelected());
        multiplexer.setLanAvailable(lanToggle.isSelected());
    }
}
