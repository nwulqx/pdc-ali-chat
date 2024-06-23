package com.aliyun.bailian.chatgpt.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

public class WavHeader {
    public int fileLength;
    public int fmtHdrLeth;
    public short bitsPerSample;
    public short channels;
    public short formatTag;
    public int samplesPerSec;
    public int avgBytesPerSec;
    public short blockAlign;
    public int dataHdrLeth;

    public byte[] getHeader() throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        writeString(out, "RIFF");
        writeInt(out, fileLength);
        writeString(out, "WAVE");
        writeString(out, "fmt ");
        writeInt(out, fmtHdrLeth);
        writeShort(out, formatTag);
        writeShort(out, channels);
        writeInt(out, samplesPerSec);
        writeInt(out, avgBytesPerSec);
        writeShort(out, blockAlign);
        writeShort(out, bitsPerSample);
        writeString(out, "data");
        writeInt(out, dataHdrLeth);
        return out.toByteArray();
    }

    private void writeString(ByteArrayOutputStream out, String value) throws IOException {
        out.write(value.getBytes());
    }

    private void writeInt(ByteArrayOutputStream out, int value) throws IOException {
        out.write(value >> 0);
        out.write(value >> 8);
        out.write(value >> 16);
        out.write(value >> 24);
    }

    private void writeShort(ByteArrayOutputStream out, short value) throws IOException {
        out.write(value >> 0);
        out.write(value >> 8);
    }
}
