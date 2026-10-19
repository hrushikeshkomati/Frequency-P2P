module com.frequency {
    requires javafx.controls;
    requires javafx.fxml;
    requires javafx.graphics;
    requires org.bouncycastle.provider;
    requires java.logging;
    requires java.net.http;

    opens com.frequency to javafx.fxml, javafx.graphics;
    opens com.frequency.ui to javafx.fxml;
    opens com.frequency.crypto to org.bouncycastle.provider;

    exports com.frequency;
    exports com.frequency.crypto;
    exports com.frequency.network;
    exports com.frequency.ui;
}
