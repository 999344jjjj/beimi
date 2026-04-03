cc.Class({
    extends: cc.Component,

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

    },

    // use this for initialization
    onLoad: function () {
        cc.beimi.room_callback = null ;  //加入房间回调函数
    },
    ready:function(){
        var check = false ;
        if(cc.beimi){
            check = true ;
        }else{
            this.scene("login" , this) ;
        }
        return check ;
    },
    connect:function(){
        let self = this ;
        // 防止重复场景切换的标志
        if(!cc.beimi._sceneSwitching) {
            cc.beimi._sceneSwitching = false;
        }
        /**
         * 登录成功后，创建 Socket链接，
         */
        if(cc.beimi.socket != null){
            cc.beimi.socket.disconnect();
            cc.beimi.socket = null ;
        }
        
        // 尝试连接socket，但失败不影响游戏
        try{
            cc.beimi.socket = window.io.connect(cc.beimi.http.wsURL + '/bm/game',{"reconnection":true});
        }catch(e){
            console.warn('[connect] Socket连接失败，使用离线模式:', e);
            cc.beimi.socket = null;
            return null;
        }
        var param = {
            token:cc.beimi.authorization,
            orgi:cc.beimi.user.orgi
        } ;

        cc.game.on(cc.game.EVENT_HIDE, function(event) {
            //self.alert("HIDE TRUE");
        });
        cc.game.on(cc.game.EVENT_SHOW, function(event) {
            console.log("SHOW TRUE");
            //self.alert("SHOW TRUE");
        });

        // 检查socket是否成功创建
        if(!cc.beimi.socket){
            console.log('[connect] Socket未创建，跳过事件绑定');
            return null;
        }
        
        cc.beimi.socket.on('connect', function (data) {
            console.log("connected to server");
            //self.alert("connected to server");
        });

        cc.beimi.socket.on('disconnect', function (data) {
            console.log("disconnected from server");
            //self.alert("disconnected from server");

        });


        cc.beimi.socket.emit("gamestatus" , JSON.stringify(param));
        cc.beimi.socket.on("gamestatus" , function(result){
            console.log('[connect] 收到gamestatus响应');
            if(result!=null) {
                var data = self.parse(result) ;
                // 只在没有设置extparams时才处理gamestatus，避免干扰手动场景切换
                if(cc.beimi.extparams == null){
                    if(data.gamestatus == "playing" && data.gametype != null){
                        /**
                         * 修正重新进入房间后 玩法被覆盖的问题，从服务端发送过来的 玩法数据是 当前玩家所在房间的玩法，是准确的
                         */
                        if(cc.beimi.extparams!=null){
                            cc.beimi.extparams.playway = data.playway ;
                            cc.beimi.extparams.gametype = data.gametype ;
                            if(data.cardroom!=null && data.cardroom == true){
                                cc.beimi.extparams.gamemodel = "room";
                            }
                        }
                        self.scene(data.gametype , self) ;
                    }else if(data.gamestatus == "timeout"){ //会话过期，退出登录 ， 会话时间由后台容器提供控制
                        cc.beimi.sessiontimeout = true ;
                        self.alert("登录已过期，请重新登录") ;
                    }else{
                        // 不自动场景切换，让用户手动点击
                    }
                }
                cc.beimi.gamestatus = data.gamestatus;
            }
        });


        /**
         * 加入房卡模式的游戏类型 ， 需要校验是否是服务端发送的消息
         */
        cc.beimi.socket.on("searchroom" , function(result){
            //result 是 GamePlayway数据，如果找到了 房间数据，则进入房间，如果未找到房间数据，则提示房间不存在
            if(result!=null && cc.beimi.room_callback!=null) {
                cc.beimi.room_callback(result , self);
            }
        });
        return cc.beimi.socket ;
    },
    disconnect:function(){
        if(cc.beimi.socket != null){
            cc.beimi.socket.disconnect();
            cc.beimi.socket = null ;
        }
    },
    registercallback:function(callback){
        cc.beimi.room_callback = callback ;
    },
    cleancallback:function(){
        cc.beimi.room_callback = null ;
    },
    getCommon:function(common){
        var object = cc.find("Canvas/script/"+common) ;
        return object.getComponent(common);
    },
    loadding:function(){
        if(cc.beimi.loadding.size() > 0){
            this.loaddingDialog = cc.beimi.loadding.get();
            this.loaddingDialog.parent = cc.find("Canvas");

            this._animCtrl = this.loaddingDialog.getComponent(cc.Animation);
            var animState = this._animCtrl.play("loadding");
            animState.wrapMode = cc.WrapMode.Loop;
        }
    },
    alert:function(message){
        if(cc.beimi.dialog.size() > 0){
            this.alertdialog = cc.beimi.dialog.get();
            this.alertdialog.parent = cc.find("Canvas");
            let node = this.alertdialog.getChildByName("message") ;
            if(node!=null && node.getComponent(cc.Label)){
                node.getComponent(cc.Label).string = message ;
            }
        }
        this.closeloadding();
    },
    closeloadding:function(){
        console.log('[closeloadding] 尝试关闭loading动画');
        var loaddingNode = cc.find("Canvas/loadding");
        if(loaddingNode){
            console.log('[closeloadding] 找到loading节点，准备回收');
            try{
                cc.beimi.loadding.put(loaddingNode);
                console.log('[closeloadding] loading节点回收成功');
            }catch(e){
                console.warn('[closeloadding] 回收loading节点失败:', e);
                // 如果回收失败，直接销毁
                loaddingNode.destroy();
            }
        }else{
            console.log('[closeloadding] 没有找到loading节点');
        }
    },
    closeOpenWin:function(){
        if(cc.beimi.openwin != null){
            cc.beimi.openwin.destroy();
            cc.beimi.openwin = null ;
        }
    },
    pvalistener:function(context , func){
        cc.beimi.listener = func ;
        cc.beimi.context = context ;
    },
    cleanpvalistener:function(){
        cc.beimi.listener = null ;
        cc.beimi.context = null ;
    },
    pva:function(pvatype , balance){   //客户端资产变更（仅显示，多个地方都会调用 pva方法）
        if(pvatype != null){
            if(pvatype == "gold"){
                cc.beimi.user.goldcoins = balance ;
            }else if(pvatype == "cards"){
                cc.beimi.user.cards = balance ;
            }else if(pvatype == "diamonds"){
                cc.beimi.user.diamonds = balance ;
            }
        }
    },
    updatepva:function(){
        if(cc.beimi.listener != null && cc.beimi.context != null){
            cc.beimi.listener(cc.beimi.context);
        }
    },
    resize:function(){
        let win = cc.director.getWinSize() ;
        cc.view.setDesignResolutionSize(win.width, win.height, cc.ResolutionPolicy.EXACT_FIT);
    },
    closealert:function(){
        if(cc.find("Canvas/alert")){
            cc.beimi.dialog.put(cc.find("Canvas/alert"));
        }
    },
    scene:function(name , self){
        console.log('[scene] 直接加载场景:', name);
        // 直接加载场景，不搞任何复杂的东西
        cc.director.loadScene(name);
    },
    preload:function(extparams , self){ 
        console.log('[preload] 开始加载, gametype:', extparams.gametype, 'playway:', extparams.playway);
        cc.beimi.extparams = extparams ;
        // 直接进入场景，不等待任何东西
        console.log('[preload] 直接调用scene函数');
        self.scene(extparams.gametype, self);
    },
    root:function(){
        return cc.find("Canvas");
    },
    decode:function(data){
        var cards = new Array();

        if(!cc.sys.isNative) {
            var dataView = new DataView(data);
            for(var i= 0 ; i<data.byteLength ; i++){
                cards[i] = dataView.getInt8(i);
            }
        }else{
            var Base64 = require("Base64");
            var strArray = Base64.decode(data) ;

            if(strArray && strArray.length > 0){
                for(var i= 0 ; i<strArray.length ; i++){
                    cards[i] = strArray[i];
                }
            }
        }

        return cards ;
    },
    parse:function(result){
        var data ;
        if(!cc.sys.isNative){
            data = result;
        }else{
            data = JSON.parse(result) ;
        }
        return data ;
    },
    reset:function(data , result){
        //放在全局变量
        cc.beimi.authorization = data.token.id ;
        cc.beimi.user = data.data ;
        cc.beimi.games = data.games ;
        cc.beimi.gametype = data.gametype ;

        cc.beimi.data = data ;
        cc.beimi.playway = null ;
        this.io.put("userinfo" ,result );
    },
    logout:function(){
        this.closeOpenWin();
        cc.beimi.authorization = null ;
        cc.beimi.user = null ;
        cc.beimi.games = null ;

        cc.beimi.playway = null ;

        this.disconnect();
    },
    socket:function(){
        let socket = cc.beimi.socket ;
        if(socket == null){
            socket = this.connect();
        }
        return socket ;
    },
    map:function(command, callback){
        if(cc.beimi!=null && cc.beimi.routes[command] == null){
            cc.beimi.routes[command] = callback || function(){};
        }
    },
    cleanmap:function(){
        if(cc.beimi!=null && cc.beimi.routes != null){
            //cc.beimi.routes.splice(0 , cc.beimi.routes.length) ;
            for(var p in cc.beimi.routes){
                delete cc.beimi.routes[p];
            }
        }
    },
    route:function(command){
        return cc.beimi.routes[command] || function(){};
    },
    /**
     * 解决Layout的渲染顺序和显示顺序不一致的问题
     * @param target
     * @param func
     */
    layout:function(target , func){
        if(target != null){
            let temp = new Array() ;
            let children = target.children ;
            for(var inx = 0 ; inx < children.length ; inx++){
                temp.push(children[inx]) ;
            }
            for(var inx = 0 ; inx < temp.length ; inx++){
                target.removeChild(temp[inx]) ;
            }

            temp.sort(func) ;
            for(var inx =0 ; inx<temp.length ; inx++){
                temp[inx].parent = target ;
            }
            temp.splice(0 , temp.length) ;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
