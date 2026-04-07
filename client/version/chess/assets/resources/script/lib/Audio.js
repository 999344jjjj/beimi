cc.Class({
    extends: cc.Component,

    properties: {
        bgVolume: 1.0,
        deskVolume: 1.0,
        bgAudioID: -1,
        sfxVolume: 1.0
    },

    init: function () {
        var bgVol = cc.sys.localStorage.getItem("bgVolume");
        if (bgVol != null) {
            this.bgVolume = parseFloat(bgVol);
        }
        var deskVol = cc.sys.localStorage.getItem("deskVolume");
        if (deskVol != null) {
            this.deskVolume = parseFloat(deskVol);
            this.sfxVolume = parseFloat(deskVol);
        }
        cc.game.on(cc.game.EVENT_HIDE, function () {
            try { cc.audioEngine.pauseAll(); } catch (e) {}
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            try { cc.audioEngine.resumeAll(); } catch (e) {}
        });
    },

    playBGM: function (url) {
        console.log('[Audio] 准备播放背景音乐:', url);
        try {
            cc.audioEngine.stopMusic();
        } catch (e) {
            console.warn('[Audio] stopMusic失败:', e);
        }
        try {
            // 兼容旧版 API，同时尝试多种加载方式
            var self = this;
            var audioPath = "resources/sounds/" + url;
            var audioUrl = null;
            
            // 方法1: 尝试使用 cc.url.raw (旧版方式)
            if (cc.url && cc.url.raw) {
                try {
                    audioUrl = cc.url.raw(audioPath);
                    console.log('[Audio] 使用 cc.url.raw 加载, URL:', audioUrl);
                    this.bgAudioID = cc.audioEngine.playMusic(audioUrl, true);
                    console.log('[Audio] 背景音乐播放成功 (cc.url.raw), audioID:', this.bgAudioID);
                    return;
                } catch (e) {
                    console.warn('[Audio] cc.url.raw 方式失败:', e);
                }
            }
            
            // 方法2: 尝试直接使用路径
            try {
                this.bgAudioID = cc.audioEngine.playMusic(audioPath, true);
                console.log('[Audio] 背景音乐播放成功 (直接路径), audioID:', this.bgAudioID);
            } catch (e) {
                cc.warn('[Audio] 所有音频加载方式都失败了:', e);
                this.bgAudioID = -1;
            }
        } catch (e) {
            cc.warn('[Audio] 播放背景音乐失败（不影响进入房间）: ' + url, e);
            this.bgAudioID = -1;
        }
    },

    playSFX: function (url) {
        if (this.sfxVolume <= 0) {
            return false;
        }
        try {
            // 兼容旧版 API，同时尝试多种加载方式
            var self = this;
            var audioPath = "resources/sounds/" + url;
            var audioUrl = null;
            
            // 方法1: 尝试使用 cc.url.raw (旧版方式)
            if (cc.url && cc.url.raw) {
                try {
                    audioUrl = cc.url.raw(audioPath);
                    cc.audioEngine.playEffect(audioUrl, false, this.deskVolume);
                    return true;
                } catch (e) {
                    console.warn('[Audio] cc.url.raw 音效方式失败:', e);
                }
            }
            
            // 方法2: 尝试直接使用路径
            try {
                cc.audioEngine.playEffect(audioPath, false, this.deskVolume);
                return true;
            } catch (e) {
                cc.warn('[Audio] 音效加载失败:', e);
                return true;
            }
        } catch (e) {
            cc.warn('[Audio] 播放音效失败（不影响进入房间）: ' + url, e);
            return true;
        }
    },

    setSFXVolume: function (v) {
        if (this.sfxVolume != v) {
            cc.sys.localStorage.setItem("deskVolume", v);
            this.deskVolume = v;
            this.sfxVolume = v;
        }
    },

    getState: function () {
        try {
            return cc.audioEngine.getState(this.bgAudioID);
        } catch (e) {
            return cc.audioEngine.AudioState.ERROR;
        }
    },

    setBGMVolume: function (v, force) {
        if (this.bgAudioID >= 0) {
            try {
                if (v > 0 && cc.audioEngine.getState(this.bgAudioID) === cc.audioEngine.AudioState.PAUSED) {
                    cc.audioEngine.resume(this.bgAudioID);
                } else if (v == 0) {
                    cc.audioEngine.pause(this.bgAudioID);
                }
            } catch (e) {}
        }
        if (this.bgVolume != v || force) {
            cc.sys.localStorage.setItem("bgVolume", v);
            this.bgVolume = v;
            if (this.bgAudioID >= 0) {
                try { cc.audioEngine.setVolume(this.bgAudioID, v); } catch (e) {}
            }
        }
    },

    pauseAll: function () {
        try { cc.audioEngine.pauseAll(); } catch (e) {}
    },

    resumeAll: function () {
        try { cc.audioEngine.resumeAll(); } catch (e) {}
    }
});
