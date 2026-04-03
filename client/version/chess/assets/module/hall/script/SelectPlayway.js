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
        // ...
        first: {
            default: null,
            type: cc.Node
        },
        second: {
            default: null,
            type: cc.Node
        },
        gamepoint:{
            default: null,
            type: cc.Node
        },
        title:{
            default: null,
            type: cc.Node
        },
        global: {
            default: null,
            type: cc.Node
        },
        playway: {
            default: null,
            type: cc.Prefab
        },
        content: {
            default: null,
            type: cc.Node
        },
    },

    // use this for initialization
    onLoad: function () {
        if(cc.beimi != null && cc.beimi.user != null){
            this.disMenu("first") ;
            this.playwaypool = new cc.NodePool();
            for(var i=0 ; i<20 ; i++){ //最大玩法数量不能超过20种
                this.playwaypool.put(cc.instantiate(this.playway));
            }
            this.playwayarray = new Array();
            if(this.gamepoint){
                // 直接显示所有游戏按钮，不依赖于后端返回的游戏数据
                for(var inx=0 ; inx < this.gamepoint.children.length ; inx++){
                    this.gamepoint.children[inx].active = true ;
                }
            }
        }
    },
    onClick:function(event, data){
        this.disMenu("second") ;
        var girlAni = this.global.getComponent("DefaultHallDataBind");
        girlAni.playToLeft();
        this._secondAnimCtrl = this.second.getComponent(cc.Animation);
        this._secondAnimCtrl.play("playway_display");

        if(this.title){
            for(var inx = 0 ; inx<this.title.children.length ; inx++){
                if(this.title.children[inx].name == data){
                    this.title.children[inx].active = true ;
                }else{
                    this.title.children[inx].active = false ;
                }
            }
        }
        /**
         * 加载预制的 玩法
         * 场景名称映射：把按钮名称映射到实际存在的场景
         */
        // 场景名称映射表
        var sceneMap = {
            'dizhu': 'dizhu',      // 斗地主
            'majiang': 'majiang',  // 麻将
            'river': 'majiang',    // 血流 -> 麻将
            'blood': 'majiang',    // 血战 -> 麻将
            'dezhou': 'dezhou',    // 德州
            'zhajinhua': 'zhajinhua', // 炸金花
            'bull': 'bullfight',   // 斗牛 -> bullfight
            'bullfight': 'bullfight' // 斗牛
        };
        
        // 获取实际场景名称，如果没有映射则使用原始名称
        var sceneName = sceneMap[data] || data;
        console.log('[SelectPlayway] 按钮:', data, '-> 场景:', sceneName);
        
        // 模拟游戏玩法数据
        var gametype = {
            playways: [
                { id: 1, name: '初级场', min: 100, max: 1000, code: sceneName, onlineusers: 123, score: '1000', skin: '1', shuffle: true, level: '1', mincoins: 100, maxcoins: 1000 },
                { id: 2, name: '中级场', min: 1000, max: 10000, code: sceneName, onlineusers: 45, score: '10000', skin: '1', shuffle: true, level: '1', mincoins: 1000, maxcoins: 10000 },
                { id: 3, name: '高级场', min: 10000, max: 100000, code: sceneName, onlineusers: 12, score: '100000', skin: '1', shuffle: true, level: '2', mincoins: 10000, maxcoins: 100000 }
            ]
        };
        if(gametype!=null){
            for(var inx =0 ; inx < gametype.playways.length ; inx++){
                /**
                 * 此处需要做判断，检查 对象池有足够的对象可以使用
                 */
                var playway = this.playwaypool.get();
                var script = playway.getComponent("Playway") ;
                if(script == null){
                    script = playway.getComponent("RoomPlayway") ;
                }
                script.init(gametype.playways[inx]);
                playway.parent = this.content ;
                this.playwayarray.push(playway) ;
            }
        }
    },
    onRoomClick:function(){
        this.disMenu("third") ;
        this._menuDisplay = this.third.getComponent(cc.Animation);
        this._menuDisplay.play("play_room_display");
    },
    onSecondBack:function(event ,data){
        var girlAni = this.global.getComponent("DefaultHallDataBind");
        girlAni.playToRight();
        this.collect();
        this.disMenu("first") ;
    },
    onThirddBack:function(event ,data){
        this.disMenu("first") ;
    },
    collect:function(){
        for(var inx =0 ; inx < this.playwayarray.length ; inx++){
            this.playwaypool.put(this.playwayarray[inx]);
        }
        this.playwayarray.splice(0 ,this.playwayarray.length );
    },
    disMenu:function(order){
        if(order == 'first'){
            this.first.active = true ;
            this.second.active = false ;
            if(this.third != null){
                this.third.active = false ;
            }
        }else if(order == 'second'){
            this.first.active = false;
            this.second.active = true;
            if(this.third != null){
                this.third.active = false ;
            }
        }else if(order == 'third'){
            this.first.active = false;
            this.second.active = false;
            if(this.third != null){
                this.third.active = true ;
            }
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
