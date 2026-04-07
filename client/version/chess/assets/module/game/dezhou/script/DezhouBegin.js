var beiMiCommon = require("BeiMiCommon");
cc.Class({
    extends: beiMiCommon,

    properties: {
        gamebtn: {
            default: null,
            type: cc.Node
        },
        poker: {
            default: null,
            type: cc.Node
        },
        publicCardsPanel: {
            default: null,
            type: cc.Node
        },
        waitting: {
            default: null,
            type: cc.Prefab
        },
        summary_win: {
            default: null,
            type: cc.Prefab
        },
        summary: {
            default: null,
            type: cc.Prefab
        },
        inviteplayer: {
            default: null,
            type: cc.Prefab
        },
        betPanel: {
            default: null,
            type: cc.Node
        },
        potLabel: {
            default: null,
            type: cc.Label
        },
        actionButtons: {
            default: [],
            type: [cc.Node]
        }
    },

    onLoad: function () {
        this.resize();
        this.player = new Array();
        this.pokercards = new Array();
        this.publicCards = new Array();
        if(this.publicCardsPanel) this.publicCardsPanel.active = false;
        if(this.betPanel) this.betPanel.active = false;
        this.summarypage = null;
        this.inited = false;
        this.pot = 0;
        this.currentBet = 0;
        
        if (cc.beimi != null) {
            if (cc.beimi.gamestatus != null && cc.beimi.gamestatus == "playing") {
                this.recovery();
            } else if (cc.beimi.extparams != null && cc.beimi.extparams.gamemodel == "room") {
                if (this.inviteplayer) {
                    this.invite = cc.instantiate(this.inviteplayer);
                } else {
                    cc.error('[Game] inviteplayer预制体为空！请检查资源引用');
                }
            }
            this.initgame();
        }
        
        this.scheduleOnce(function() {
            this.ensureGameBtnBinding();
            this.restoreGlobalInteraction();
        }, 0.3);
    },

    begin: function () {
        console.log('[DezhouBegin] 点击开始游戏按钮');
        if (!this.ready()) {
            this.alert("网络未连接，请检查服务器是否启动");
            return;
        }
        this.statictimer("正在匹配玩家，请稍候", 3);
        this.startgame("false");
    },

    opendeal: function () {
        console.log('[DezhouBegin.opendeal] 点击开始游戏按钮');
        if (!this.ready()) {
            this.alert("网络未连接，请检查服务器是否启动");
            return;
        }
        this.statictimer("正在匹配玩家，请稍候", 3);
        this.startgame("true");
    },

    fold: function () {
        console.log('[DezhouBegin] 弃牌');
    },

    check: function () {
        console.log('[DezhouBegin] 过牌');
    },

    call: function () {
        console.log('[DezhouBegin] 跟注');
    },

    raise: function () {
        console.log('[DezhouBegin] 加注');
    },

    allin: function () {
        console.log('[DezhouBegin] 全押');
    },

    registerProxy: function (card) {
        this.pokercards.push(card);
    },

    playcards: function (game, self, x, card) {
        var pokercard = cc.instantiate(this.poker);
        pokercard.setPosition(cc.v2(x, -380));
        pokercard.parent = this.root();
        pokercard.getComponent("BeiMiCard").card = card;
        pokercard.getComponent("BeiMiCard").hide = false;
        pokercard.getComponent("BeiMiCard").game = game;
        pokercard.getComponent("BeiMiCard").self = self;
        return pokercard;
    },

    initgame: function () {
        if (cc.beimi.socket != null) {
            var self = this;
            cc.beimi.socket.on("playeready", function (result) {
                var data = JSON.parse(result);
                if (data != null) {
                    if (data.type != null && data.type == "prepare") {
                        if (self.gamebtn != null) {
                            self.gamebtn.active = false;
                        }
                    }
                }
            });
        }
    },

    newplayer: function (index, self, player, inited) {
        var play = this.player[index];
        if (play != null) {
            if (play.getComponent("MaJiangPlayer").player != null) {
                if (play.getComponent("MaJiangPlayer").player.id != player.id) {
                    play.getComponent("MaJiangPlayer").player = player;
                }
            } else {
                play.getComponent("MaJiangPlayer").player = player;
            }
            play.getComponent("MaJiangPlayer").init(inited);
        }
    },

    recovery: function () {
        console.log("恢复游戏");
    },

    startgame: function (enableai) {
        if (cc.beimi.socket != null) {
            cc.beimi.socket.emit("gamestatus", JSON.stringify({
                token: cc.beimi.authorization,
                type: "begin",
                enableai: enableai
            }));
        }
    },

    statictimer: function (str, waitime) {
        console.log("[timer]" + str);
    },

    resize: function () {
        var win = cc.winSize;
        cc.view.setDesignResolutionSize(win.width, win.height, cc.ResolutionPolicy.EXACT_FIT);
    },
    
    ensureGameBtnBinding: function() {
        console.log('[DezhouBegin] 确保按钮绑定...');
        
        if (!this.gamebtn) {
            this.gamebtn = cc.find('Canvas/global/main/game');
            console.log('[DezhouBegin] 自动绑定 gamebtn:', this.gamebtn);
        }
        
        if (this.gamebtn) {
            var self = this;
            this.gamebtn.on(cc.Node.EventType.TOUCH_END, function() {
                console.log('[DezhouBegin] TOUCH_END 事件触发（直接监听）');
                self.begin();
            }, this);
            console.log('[DezhouBegin] 已添加直接监听');
        }
    },
    
    restoreGlobalInteraction: function() {
        console.log('[DezhouBegin] 恢复全局交互...');
        
        var canvas = cc.find('Canvas');
        if (canvas) {
            canvas.active = true;
            canvas.opacity = 255;
            console.log('[DezhouBegin] Canvas 已恢复');
        }
        
        var maskNames = ['mask', 'blocker', 'overlay'];
        for (var i = 0; i < maskNames.length; i++) {
            var mask = cc.find('Canvas/' + maskNames[i]);
            if (mask) {
                mask.active = false;
                console.log('[DezhouBegin] 禁用遮罩:', maskNames[i]);
            }
        }
    }
});