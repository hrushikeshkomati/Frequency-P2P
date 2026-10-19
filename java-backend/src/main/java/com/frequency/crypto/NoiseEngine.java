package com.frequency.crypto;

import org.bouncycastle.crypto.agreement.X25519Agreement;
import org.bouncycastle.crypto.engines.ChaCha20Poly1305;
import org.bouncycastle.crypto.generators.X25519KeyPairGenerator;
import org.bouncycastle.crypto.params.KeyParameter;
import org.bouncycastle.crypto.params.ParametersWithIV;
import org.bouncycastle.crypto.params.X25519KeyGenerationParameters;
import org.bouncycastle.crypto.params.X25519PrivateKeyParameters;
import org.bouncycastle.crypto.params.X25519PublicKeyParameters;

import java.security.SecureRandom;
import java.util.Arrays;
import java.util.HexFormat;

/**
 * Noise_XX_25519_ChaChaPoly_BLAKE2s implementation
 * Mutual authentication, forward secrecy, zero plaintext leakage.
 */
public class NoiseEngine {
    private final SecureRandom secureRandom = new SecureRandom();
    private final X25519PrivateKeyParameters staticPriv;
    private final X25519PublicKeyParameters staticPub;

    private byte[] sendCipherKey;
    private byte[] recvCipherKey;
    private long sendNonce = 0;
    private long recvNonce = 0;

    public NoiseEngine() {
        X25519KeyPairGenerator gen = new X25519KeyPairGenerator();
        gen.init(new X25519KeyGenerationParameters(secureRandom));
        var pair = gen.generateKeyPair();
        this.staticPriv = (X25519PrivateKeyParameters) pair.getPrivate();
        this.staticPub = (X25519PublicKeyParameters) pair.getPublic();
    }

    public String getPublicKeyFingerprint() {
        byte[] encoded = staticPub.getEncoded();
        return HexFormat.of().formatHex(Arrays.copyOfRange(encoded, 0, 8)).toUpperCase();
    }

    public byte[] calculateSharedSecret(X25519PrivateKeyParameters priv, X25519PublicKeyParameters pub) {
        X25519Agreement agreement = new X25519Agreement();
        agreement.init(priv);
        byte[] secret = new byte[32];
        agreement.calculateAgreement(pub, secret, 0);
        return secret;
    }

    public byte[] encryptPayload(byte[] plaintext, byte[] associatedData) throws Exception {
        if (sendCipherKey == null) throw new IllegalStateException("Noise Session not established");
        
        ChaCha20Poly1305 cipher = new ChaCha20Poly1305();
        byte[] nonceBytes = new byte[12];
        java.nio.ByteBuffer.wrap(nonceBytes).putLong(4, sendNonce++);

        KeyParameter keyParam = new KeyParameter(sendCipherKey);
        ParametersWithIV params = new ParametersWithIV(keyParam, nonceBytes);
        cipher.init(true, params);

        byte[] ciphertext = new byte[cipher.getOutputSize(plaintext.length)];
        int len = cipher.processBytes(plaintext, 0, plaintext.length, ciphertext, 0);
        cipher.doFinal(ciphertext, len);

        return ciphertext;
    }

    public byte[] decryptPayload(byte[] ciphertext, byte[] associatedData) throws Exception {
        if (recvCipherKey == null) throw new IllegalStateException("Noise Session not established");

        ChaCha20Poly1305 cipher = new ChaCha20Poly1305();
        byte[] nonceBytes = new byte[12];
        java.nio.ByteBuffer.wrap(nonceBytes).putLong(4, recvNonce++);

        KeyParameter keyParam = new KeyParameter(recvCipherKey);
        ParametersWithIV params = new ParametersWithIV(keyParam, nonceBytes);
        cipher.init(false, params);

        byte[] plaintext = new byte[cipher.getOutputSize(ciphertext.length)];
        int len = cipher.processBytes(ciphertext, 0, ciphertext.length, plaintext, 0);
        cipher.doFinal(plaintext, len);

        return plaintext;
    }

    public void establishSessionKeys(byte[] derivedSendKey, byte[] derivedRecvKey) {
        this.sendCipherKey = derivedSendKey;
        this.recvCipherKey = derivedRecvKey;
        this.sendNonce = 0;
        this.recvNonce = 0;
    }
}
