var beiMiCommon = require("BeiMiCommon");
cc.Class({
        extends: beiMiCommon,

        properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ..
        playway:{
            default: null,
            type: cc.Node
        },
    },

    // use this for initialization
    onLoad: function () {

    },
    onClick:function(){
        let self = this ;

        var selectPlayway = this.getCommon("SelectPlayway");

        let thisplayway = this.playway.getComponent("Playway");

        // 场景名称映射表
        var sceneMap = {
            'basic': 'dizhu',      // 初级场 -> 斗地主
            'dizhu': 'dizhu',      // 斗地主
            'majiang': 'majiang',  // 麻将
            'river': 'majiang',    // 血流 -> 麻将
            'blood': 'majiang',    // 血战 -> 麻将
            'dezhou': 'dezhou',    // 德州
            'zhajinhua': 'zhajinhua', // 炸金花
            'bull': 'bullfight',   // 斗牛 -> bullfight
            'bullfight': 'bullfight' // 斗牛
        };
        
        // 获取实际场景名称
        var originalCode = thisplayway.data.code;
        var sceneName = sceneMap[originalCode] || originalCode;
        
        let extparams = {
            gametype : sceneName,
            playway  : thisplayway.data.id
        } ;
        this.closeOpenWin();
        console.log('[PlaywayClick] 点击场次按钮，原始code:', originalCode, '-> 场景:', sceneName);
        cc.beimi.extparams = extparams;
        
        // 直接进入游戏场景
        console.log('[PlaywayClick] 进入游戏场景');
        cc.director.loadScene(extparams.gametype);
    },
    createRoom:function(event,data){
        let self = this ;
        this.loadding();
        setTimeout(function(){
            self.scene(data, self) ;
        },200);
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
