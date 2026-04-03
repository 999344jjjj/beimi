var beiMiCommon = require("BeiMiCommon");
cc.Class({
    extends: beiMiCommon,

    // use this for initialization
    onLoad: function () {

    },
    login:function(){
        this.io = require("IOUtils");
        this.loadding();
        if(this.io.get("userinfo") == null){
            //发送游客注册请求
            var xhr = cc.beimi.http.httpGet("/api/guest", this.sucess , this.error , this);
        }else{
            //通过ID获取 玩家信息
            var data = JSON.parse(this.io.get("userinfo")) ;
            if(data.token != null){     //获取用户登录信息
                var xhr = cc.beimi.http.httpGet("/api/guest?token="+data.token.id, this.sucess , this.error , this);
            }
        }
	},
    sucess:function(result , object){
        var data = JSON.parse(result) ;
        if(data!=null && data.token!=null && data.data!=null){
            //放在全局变量
            object.reset(data , result);
            cc.beimi.gamestatus = data.data.gamestatus ;
            /**
             * 登录成功后即创建Socket链接
             */
            object.connect();
            //预加载场景
            if(cc.beimi.gametype!=null && cc.beimi.gametype != ""){//只定义了单一游戏类型 ，否则 进入游戏大厅
                object.scene(cc.beimi.gametype , object) ;
            }else{
                //进入游戏大厅
                object.scene("hall" , object) ;
            }
        }
    },
    error:function(object){
        object.closeloadding(object.loaddingDialog);
        console.log('[login] 网络请求失败，使用离线模式直接进入游戏大厅');
        // 创建模拟用户数据，允许离线进入游戏
        var mockData = {
            token: { id: 'offline_token_' + Date.now() },
            data: {
                id: 'guest_' + Date.now(),
                username: '游客' + Math.floor(Math.random() * 10000),
                goldcoins: 10000,
                cards: 10,
                diamonds: 0,
                gamestatus: 'notready',
                orgi: 'beimi'
            },
            games: [],
            gametype: null
        };
        object.reset(mockData, JSON.stringify(mockData));
        cc.beimi.gamestatus = 'notready';
        // 直接进入游戏大厅，不创建socket连接
        object.scene("hall", object);
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
