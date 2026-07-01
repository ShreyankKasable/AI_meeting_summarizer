// Ported unchanged from the old frontend/bridge.js — pure functions, no DOM
// dependency, so they're safe to unit-test directly.

export function concatFloat32(arr) {
    const total = arr.reduce((n, b) => n + b.length, 0);
    const out = new Float32Array(total);
    let o = 0;
    for (const b of arr) {
        out.set(b, o);
        o += b.length;
    }
    return out;
}

// Encodes mono Float32 PCM into a 16-bit PCM WAV ArrayBuffer (RIFF header +
// data). Returns the raw buffer so it can be inspected directly in tests.
export function encodeWavBuffer(samples, sr) {
    const n = samples.length;
    const buffer = new ArrayBuffer(44 + n * 2);
    const view = new DataView(buffer);
    const writeStr = (off, str) => {
        for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i));
    };
    writeStr(0, "RIFF");
    view.setUint32(4, 36 + n * 2, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sr, true);
    view.setUint32(28, sr * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, n * 2, true);
    let off = 44;
    for (let i = 0; i < n; i++) {
        let s = Math.max(-1, Math.min(1, samples[i]));
        s = s < 0 ? s * 0x8000 : s * 0x7fff;
        view.setInt16(off, s | 0, true);
        off += 2;
    }
    return buffer;
}

// Same encoding, wrapped as a Blob ready to upload.
export function encodeWav(samples, sr) {
    return new Blob([encodeWavBuffer(samples, sr)], { type: "audio/wav" });
}
