package com.aliyun.bailian.chatgpt.dto;

import com.aliyun.bailian.chatgpt.config.XMLYSpeechConfig;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class SpeechSynthesisRequest {
    private String text;
    private String lang = "zh-cn";
    private boolean ssml = false;
    private Speaker speaker;
    private int sr = 16000;
    @JsonProperty("audio_format")
    private String audioFormat = "mp3";
    private String br = "64k";
    private double rate;
    private double volume;
    private double pitch;
    @JsonProperty("result_audio_type")
    private String resultAudioType = "base64";
    private int priority = 1000;

    @Data
    public static class Speaker {
        private String domain;
        @JsonProperty("speaker_name")
        private String speakerName;
        @JsonProperty("speaker_variant")
        private String speakerVariant;
    }

    public SpeechSynthesisRequest(String text, XMLYSpeechConfig config) {
        this.text = text;
        this.rate = config.getRate();
        this.volume = config.getVolume();
        this.pitch = config.getPitch();
        this.speaker = new Speaker();
        this.speaker.domain = config.getDomain();
        this.speaker.speakerName = config.getSpeakerName();
        this.speaker.speakerVariant = config.getSpeakerVariant();
    }
}