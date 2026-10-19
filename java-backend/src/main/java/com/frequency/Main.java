package com.frequency;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.paint.Color;
import javafx.stage.Stage;

import java.util.Objects;
import java.util.logging.Logger;

/**
 * Frequency: Production JavaFX Application
 * Outputs standalone Windows .exe and Android .apk
 */
public class Main extends Application {
    private static final Logger LOGGER = Logger.getLogger(Main.class.getName());

    @Override
    public void start(Stage primaryStage) throws Exception {
        LOGGER.info("Initializing Frequency E2EE P2P Engine on " + System.getProperty("os.name"));

        FXMLLoader loader = new FXMLLoader(getClass().getResource("/com/frequency/ui/main.fxml"));
        Parent root = loader.load();

        Scene scene = new Scene(root, 1180, 760);
        scene.setFill(Color.web("#0A0A0A"));
        
        String css = Objects.requireNonNull(getClass().getResource("/com/frequency/ui/style.css")).toExternalForm();
        scene.getStylesheets().add(css);

        primaryStage.setTitle("Frequency | E2EE Mesh Platform");
        primaryStage.setScene(scene);
        primaryStage.setMinWidth(960);
        primaryStage.setMinHeight(640);
        primaryStage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
