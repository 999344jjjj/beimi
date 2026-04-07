var beiMiCommon = require("BeiMiCommon");
cc.Class({
    extends: beiMiCommon,

    properties: {
        gamebtn: {
            default: null,
            type: cc.Node
        },
        continuegamebtn:{
            default: null,
            type: cc.Node
        },
        poker: {
            default: null,
            type: cc.Node
        },
        lastCardsPanel: {   //底牌
            default: null,
            type: cc.Node
        },
        waitting: {
            default: null,
            type: cc.Prefab
        },
        ratio:{   //底牌
            default: null,
            type: cc.Label
        },
        summary_win:{
            default:null ,
            type : cc.Prefab
        },
        summary:{
            default:null ,
            type : cc.Prefab
        },
        inviteplayer:{
            default:null ,
            type : cc.Prefab
        }
    },

    onLoad: function () {
        console.log('[DizhuBegin.onLoad] 开始加载');
        this.resize();

        this.player = new Array() ;     //存放玩家数据
        this.pokercards = new Array();
        this.lastcards = new Array();
        if (this.lastCardsPanel) {
            this.lastCardsPanel.active = false ;
        }
        this.summarypage = null ;
        this.inited = false ;
        this.lasttip = null ;
        
        console.log('[DizhuBegin.onLoad] 初始化game对象');
        this.game = this.getCommon("DizhuDataBind");
        console.log('[DizhuBegin.onLoad] game对象初始化完成:', this.game);
        
        if(cc.beimi!=null){
            if(cc.beimi.gamestatus!=null && cc.beimi.gamestatus == "playing"){
                this.recovery() ;
            }else if(cc.beimi.extparams!=null && cc.beimi.extparams.gamemodel == "room"){
                if(this.inviteplayer) {
                    this.invite = cc.instantiate(this.inviteplayer) ;
                }
            }
            this.initgame();
        }
        
        this.scheduleOnce(function() {
            this.ensureGameBtnBinding();
            this.restoreGlobalInteraction();
        }, 0.3);
        
        console.log('[DizhuBegin.onLoad] 加载完成');
    },
    
    begin:function(){
        console.log('[DizhuBegin] 点击开始游戏按钮');
        
        if(cc.beimi.data!=null && cc.beimi.data.enableai == true){
            this.statictimer("正在匹配玩家" , cc.beimi.data.waittime) ;
        }else{
            this.statictimer("正在匹配玩家，请稍候" , cc.beimi.data.noaiwaitime) ;
        }
        this.startgame("false") ;
    },
    
    opendeal:function(){
        console.log('[DizhuBegin.opendeal] 点击开始游戏按钮（opendeal）');
        
        if(cc.beimi.data!=null && cc.beimi.data.enableai == true){
            this.statictimer("正在匹配玩家" , cc.beimi.data.waittime) ;
        }else{
            this.statictimer("正在匹配玩家，请稍候" , cc.beimi.data.noaiwaitime) ;
        }
        this.startgame("true") ;
    },
    
    recovery:function(){
        this.statictimer("正在恢复数据，请稍候" , cc.beimi.data.waittime) ;
    },
    
    initgame:function(){
        let self = this ;
        
        if(this.gamebtn) this.gamebtn.active = true ;
        if(this.continuegamebtn) this.continuegamebtn.active = false ;
        if(this.ready()) {
            let socket = this.socket();

            this.game = this.getCommon("DizhuDataBind");

            this.map("joinroom" , this.joinroom_event) ;
            this.map("players" , this.players_event) ;
            this.map("catch" , this.catch_event) ;
            this.map("catchresult" , this.catchresult_event) ;
            this.map("lasthands" , this.lasthands_event) ;
            this.map("takecards" , this.takecards_event) ;
            this.map("ratio" , this.ratio_event) ;
            this.map("play" , this.play_event) ;
            this.map("allcards" , this.allcards_event) ;
            this.map("cardtips" , this.cardtips_event) ;
            this.map("roomready" , this.roomready_event) ;
            this.map("playeready" , this.playeready_event) ;
            this.map("recovery" , this.recovery_event) ;

            socket.on("command" , function(result){
                cc.beimi.gamestatus = "playing" ;
                if(self.inited == true){
                    var data = self.parse(result) ;
                    self.route(data.command)(data , self);
                }
            });
            socket.on("ping" , function(){
            });

            var param = {
                token:cc.beimi.authorization,
                playway:cc.beimi.extparams.playway,
                orgi:cc.beimi.user.orgi,
                extparams:cc.beimi.extparams
            } ;
            socket.emit("joinroom" ,JSON.stringify(param)) ;

            this.inited = true ;
        }
    },
    
    joinroom_event:function(data , context){
        if(data.cardroom == true && context.inviteplayer!=null){
            let script = context.invite.getComponent("BeiMiQR")
            script.init(data.roomid);
            context.invite.parent = context.root() ;
        }

        if(data.player.id && data.player.id == cc.beimi.user.id){
            context.index = data.index ;
        }else{
            var inroom = false ;
            for(var i = 0 ; i < context.player.length ; i++){
                var player = context.player[i].getComponent("PlayerRender") ;
                if(player.userid == data.player.id){
                    inroom = true ;
                }
            }
            if(inroom == false){
                context.newplayer(context.player.length , context , data.player , context.index + 1 == data.index) ;
            }
        }
    },
    
    roomready_event:function(data , context){
        if(data.cardroom == true && context.invite!=null){
            context.invite.destroy();
        }
    },
    
    playeready_event:function(data , context){
        if(data.userid == cc.beimi.user.id){
            context.gamebtn.active = false ;
        }
    },
    
    players_event:function(data,context){
        var inx = -1 ;
        for(var i = 0 ; i<data.player.length ; i++){
            if(data.player[i].id == cc.beimi.user.id){
                inx = i ; break ;
            }
        }
        if(data.player.length > 1 && inx >=0){
            var pos = inx+1 ;
            while(true){
                if(pos == data.player.length){pos = 0 ;}
                if(context.playerexist(data.player[pos], context) == false){
                    context.newplayer(context.player.length , context , data.player[pos] , context.player.length == 0 && !(pos == 0 && data.player.length < data.maxplayers) ) ;
                }
                if(pos == inx){break ;}
                pos = pos + 1;
            }
        }
    },
    
    playerexist:function(player,context){
        var inroom = false ;
        if(player.id == cc.beimi.user.id){
            inroom = true ;
        }else{
            for(var j = 0 ; j < context.player.length ; j++){
                if(context.player[j].id == player.id){
                    inroom = true ; break ;
                }
            }
        }
        return inroom ;
    },
    
    catch_event:function(data,context){
        if(context.ratio){
            context.ratio.string = data.ratio+"倍" ;
        }
        if(data.userid == cc.beimi.user.id){
            context.game.catchtimer(15);
        }else{
            for(var inx =0 ; inx<context.player.length ; inx++){
                var render = context.player[inx].getComponent("PlayerRender") ;
                if(render.userid && render.userid == data.userid){
                    render.catchtimer(15);
                    break ;
                }
            }
        }
    },
    
    recovery_event:function(data,context){
        var mycards = context.decode(data.player.cards);
        if(context.waittimer != null){
            let timer = context.waittimer.getComponent("BeiMiTimer");
            if(timer){
                timer.stop(context.waittimer) ;
            }
        }

        if(context.gamebtn) context.gamebtn.active = false ;

        if(context.ratio){
            context.ratio.string = data.ratio+"倍" ;
        }

        context.doLastCards(context.game , context , 3 , 0);
        for(var inx =0 ; inx  < mycards.length ; inx++){
            let pokencard = context.playcards(context.game , context, inx * 50-300 , mycards[inx]);
            context.registerProxy(pokencard);
        }
        for(var i=0 ; i<context.pokercards.length ; i++){
            var pokencard = context.pokercards[i];
            pokencard.getComponent("BeiMiCard").order();
        }
        context.lastCardsPanel.active = true ;

        if(data.lasthands){
            var lasthands = context.decode(data.lasthands);
            for(var i=0 ; i<context.lastcards.length ; i++){
                var last = context.lastcards[i].getComponent("BeiMiCard") ;
                last.setCard(lasthands[i]);
                last.order();
            }
            if(data.banker.userid == cc.beimi.user.id){
                context.game.lasthands(context , context.game , data.data ) ;
            }else{
                context.getPlayer(data.banker.userid).setDizhuFlag(data.data);
            }
        }
        if(data.last != null){
            let lastcards = context.decode(data.last.cards);
            if (data.last.userid == cc.beimi.user.id) {
                context.game.lasttakecards(context.game, context, data.last.cardsnum, lastcards , data.last);
            } else {
                context.getPlayer(data.last.userid).lasttakecards(context.game, context, data.last.cardsnum, lastcards , data.last);
            }

            if (data.nextplayer  == cc.beimi.user.id) {
                context.game.playtimer(context.game, 25 , data.automic);
            } else {
                context.getPlayer(data.nextplayer).playtimer(context.game, 25);
            }
        }
        if(data.cardsnum!=null && data.cardsnum.length > 0){
            for(var i =0 ; i<data.cardsnum.length ; i++){
                context.getPlayer(data.cardsnum[i].userid).resetcards(data.cardsnum[i].cardsnum);
            }
        }
    },
    
    ratio_event:function(data,context){
        if(context.ratio){
            context.ratio.string = data.ratio+"倍" ;
        }
    },
    
    catchresult_event:function(data,context){
        if(context.ratio){
            context.ratio.string = data.ratio+"倍" ;
        }
        if(data.userid == cc.beimi.user.id){
            context.game.catchresult(data);
        }else{
            setTimeout(function(){
                context.getPlayer(data.userid).catchresult(data);
            },1500) ;
        }
    },
    
    lasthands_event:function(data,context){
        var lasthands = context.decode(data.lasthands);
        for(var i=0 ; i<context.lastcards.length ; i++){
            var last = context.lastcards[i].getComponent("BeiMiCard") ;
            last.setCard(lasthands[i]);
            last.order();
        }
        if(data.userid == cc.beimi.user.id) {
            context.game.lasthands(context , context.game , data ) ;
            for(var inx =0 ; inx<context.player.length ; inx++){
                var render = context.player[inx].getComponent("PlayerRender") ;
                render.hideresult();
            }

            for(var i=0 ; i<lasthands.length ; i++){
                let func = null ;
                if(i == (lasthands.length - 1)){
                    func = cc.callFunc(function (target , data) {
                        if(data.tempcontext){
                            data.tempcontext.layout(data.tempcontext.poker , function(fir , sec){
                                return fir.zIndex - sec.zIndex ;
                            });
                        }
                    }, this , {tempcontext: context});
                }
                let pc = context.current(context.game , context ,2 * 300 + (6 + i) * 50-300, lasthands[i] , func) ;
                var beiMiCard = pc.getComponent("BeiMiCard") ;
                beiMiCard.order();
                context.registerProxy(pc);
            }

            context.game.playtimer(context.game,25 , true);
        }else{
            context.game.hideresult();
            for(var inx =0 ; inx<context.player.length ; inx++){
                var render = context.player[inx].getComponent("PlayerRender") ;
                render.hideresult();
            }
            context.getPlayer(data.userid).lasthands(context,context.game,data);
            context.getPlayer(data.userid).playtimer(context.game , 25);
        }
        for(var inx =0 ; inx<context.pokercards.length ; inx++){
            var pc = context.pokercards[inx] ;
            pc.zIndex = 54 - pc.card ;
        }
    },
    
    takecards_event:function(data,context){
        context.lasttip = null ;
        if(data.allow == true) {
            var lastcards ;
            if(data.donot == false){
                lastcards = context.decode(data.cards);
            }
            if (data.userid == cc.beimi.user.id) {
                context.game.unselected(context , context.game) ;
                context.game.lasttakecards(context.game, context, data.cardsnum, lastcards , data);
            } else {
                context.getPlayer(data.userid).lasttakecards(context.game, context, data.cardsnum, lastcards , data);
            }

            context.game.selectedcards.splice(0 ,context.game.selectedcards.length );
            if(data.over == false){
                if (data.nextplayer == cc.beimi.user.id) {
                    context.game.playtimer(context.game, 25 , data.automic);
                } else {
                    context.getPlayer(data.nextplayer).playtimer(context.game, 25);
                }
            }
        }else{
            context.game.notallow.active = true ;
            setTimeout(function(){
                context.game.notallow.active = false ;
            } , 2000);
            context.game.unselected(context , context.game);
        }
    },
    
    cardtips_event:function(data,context){
        context.game.unselected(context , context.game) ;
        if(data.allow == true) {
            var tipcards = context.decode(data.cards);
            context.lasttip = tipcards.join(",") ;
            for(var inx = 0 ; inx < tipcards.length ; inx++){
                context.game.cardtips(context , tipcards[inx] , tipcards) ;
            }
        }else{
            context.game.cardtipsfornot(context , context.game);
        }
    },
    
    play_event:function(data,context){
        cc.beimi.gamestatus = "playing" ;
        var mycards = context.decode(data.player.cards);
        if(context.waittimer){
            let timer = context.waittimer.getComponent("BeiMiTimer");
            if(timer){
                timer.stop(context.waittimer) ;
            }
        }

        let center = context.game.pokerpool.get();
        let left = context.game.pokerpool.get(),right = context.game.pokerpool.get();
        center.parent = context.root() ;
        left.parent = context.root() ;
        right.parent = context.root() ;
        center.setPosition(0,200);
        left.setPosition(0,200);
        right.setPosition(0,200);

        let finished = cc.callFunc(function (target , data) {
            if(data.game){
                data.game.pokerpool.put(data.current) ;
                data.game.pokerpool.put(data.left);
                data.game.pokerpool.put(data.right);

                for(var i=0 ; i<data.self.pokercards.length ; i++){
                    var pokencard = data.self.pokercards[i];
                    pokencard.getComponent("BeiMiCard").order();
                }

                data.self.lastCardsPanel.active = true ;
            }
        }, this , {game : context.game  , self: context, left :left , right : right , current : center});

        context.doLastCards(context.game , context , 3 , 0);

        setTimeout(function() {
            context.dealing(context.game , 6 , context , 0 , left , right , mycards) ;
            setTimeout(function(){
                context.dealing(context.game , 6 , context , 1, left , right , mycards) ;
                setTimeout(function(){
                    context.dealing(context.game , 5 , context , 2, left , right , mycards , finished) ;
                    context.reordering(context);
                },500) ;
            },500) ;
        }, 0);
    },
    
    allcards_event:function(data , context){
        cc.beimi.gamestatus = "notready" ;
        let player ;
        for(var i=0 ; i<data.players.length ; i++){
            var temp = data.players[i] ;
            if(temp.userid != cc.beimi.user.id){
                var cards = context.decode(temp.cards);
                var tempscript = context.getPlayer(temp.userid) ;
            }else{
                player = temp  ;
            }
        }
        if(player!=null) {
            context.pva("gold" , player.balance);
            context.updatepva() ;
        }
        setTimeout(function(){
            if(player!=null){
                if(player.win == true){
                    context.summarypage = cc.instantiate(context.summary_win) ;
                }else{
                    context.summarypage = cc.instantiate(context.summary) ;
                }
                context.summarypage.parent = context.root() ;
                let temp = context.summarypage.getComponent("SummaryDetail") ;
                temp.create(context , data);
            }
            context.lastCardsPanel.active = false ;

            if(data.gameRoomOver == true){
                for(var inx = 0 ; inx<context.player.length ; inx++){
                    context.player[inx].destroy();
                }
                context.player.splice(0 , context.player.length) ;
                context.player = new Array();
                context.clean();
            }
        } , 2000);
    },
    
    getPlayer:function(userid){
        var tempRender;
        for(var inx =0 ; inx<this.player.length ; inx++){
            var render = this.player[inx].getComponent("PlayerRender") ;
            if(render.userid && render.userid == userid){
                tempRender = render ; break ;
            }
        }
        return tempRender ;
    },
    
    dealing:function(game , num , self , times , left , right , cards , finished){
        for(var i=0 ; i<num ; i++){
            var myCards = self.current(game , self ,times * 300 + i * 50-300, cards[times * 6 + i] , finished) ;
            this.registerProxy(myCards);
        }
        self.otherplayer(left  , 0 , num ,game , self) ;
        self.otherplayer(right , 1 , num ,game , self) ;
    },
    
    otherplayer:function(currpoker , inx, num ,game , self){
        if(inx == 0){
            let seq = cc.sequence(
                cc.spawn(cc.moveTo(0.2, -350, 50) , cc.scaleTo(0.2, 0.3, 0.3)) , cc.moveTo(0 , 0 , 200) , cc.scaleTo(0, 1, 1)
            );
            currpoker.runAction(seq);
        }else{
            let seq = cc.sequence(
                cc.spawn(cc.moveTo(0.2, 350, 50) , cc.scaleTo(0.2, 0.3, 0.3)) , cc.moveTo(0 , 0 , 200) , cc.scaleTo(0, 1, 1)
            );
            currpoker.runAction(seq);
        }
        var render = self.player[inx].getComponent("PlayerRender") ;
        for(var i=0 ; i<num ; i++){
            render.countcards(1);
        }
    },
    
    doLastCards:function(game , self , num , card){
        for(var i=0 ; i<num ; i++){
            var width = i * 80 - 80;
            let currpoker = game.minpokerpool.get() ;
            currpoker.getComponent("BeiMiCard").setCard(card) ;
            currpoker.card = card ;
            currpoker.parent = this.lastCardsPanel;
            currpoker.setPosition(width , 0);

            self.lastcards[self.lastcards.length] = currpoker ;
        }
    },
    
    registerProxy:function(myCard){
        if(myCard){
            var beiMiCard = myCard.getComponent("BeiMiCard") ;
            beiMiCard.proxy(this.game);
        }
    },
    
    playcards:function(game , self , posx , card){
        return self.current(game ,self , posx , card , null);
    },
    
    current:function(game , self , posx , card , func){
        let currpoker = game.pokerpool.get() ;
        var beiMiCard = currpoker.getComponent("BeiMiCard") ;
        beiMiCard.setCard(card) ;
        currpoker.card = card ;
        currpoker.parent = self.poker ;
        currpoker.setPosition(0,200);

        currpoker.setScale(1,1);
        currpoker.zIndex = 100 - card ;

        self.pokercards.push(currpoker);

        if(func!=null){
            let seq = cc.sequence(cc.moveTo(0.2, posx, -180) , func);
            currpoker.runAction(seq);
        }else{
            let action = cc.moveTo(0.2, posx, -180) ;
            currpoker.runAction(action);
        }
        return currpoker;
    },
    
    reordering:function(self){
        for(var i=0 ; i<self.pokercards.length ; i++){
            self.pokercards[i].parent = self.poker ;
        }
    },
    
    newplayer:function(inx , self , data , isRight){
        console.log('[DizhuBegin.newplayer] 调用, inx:', inx, 'data:', data, 'isRight:', isRight);
        
        var pos = cc.v2(520, 100) ;
        if(isRight == false){
            pos = cc.v2(-520,100) ;
        }
        console.log('[DizhuBegin.newplayer] 位置:', pos);
        
        var rootNode = self.root();
        var playerNodeName = 'player_' + inx;
        var playerNode = cc.find(playerNodeName, rootNode);
        
        if(playerNode) {
            console.log('[DizhuBegin.newplayer] 找到现有玩家节点:', playerNodeName);
            self.player[inx] = playerNode;
            var render = playerNode.getComponent("PlayerRender") ;
            if(render){
                console.log('[DizhuBegin.newplayer] 找到PlayerRender, 初始化玩家');
                render.initplayer(data , isRight);
            }
            return;
        }
        
        if(!self.waitting){
            console.error('[DizhuBegin.newplayer] waitting 预制体为空，无法创建玩家！');
            return;
        }
        
        console.log('[DizhuBegin.newplayer] 使用 waitting 预制体创建玩家节点...');
        var playerNode = cc.instantiate(self.waitting);
        playerNode.name = 'player_' + inx;
        playerNode.setPosition(pos);
        playerNode.parent = rootNode;
        
        self.player[inx] = playerNode;
        
        var render = playerNode.getComponent("PlayerRender") ;
        if(render){
            console.log('[DizhuBegin.newplayer] 找到PlayerRender, 初始化玩家');
            render.initplayer(data , isRight);
        }
        
        console.log('[DizhuBegin.newplayer] 玩家节点创建完成！');
    },
    
    givup:function(){
        if(this.ready()){
            let socket = this.socket();
            socket.emit("giveup","giveup");
        }
    },
    
    startgame:function(opendeal){
        if(this.ready()){
            let socket = this.socket();
            socket.emit("start",opendeal);
        }
    },
    
    cardtips:function(){
        if(this.ready()){
            let socket = this.socket();
            if(this.lasttip!=null){
                socket.emit("cardtips",this.lasttip);
            }else{
                socket.emit("cardtips","");
            }
            this.lasttip = null ;
        }
    },
    
    docatch:function(){
        if(this.ready()){
            let socket = this.socket();
            socket.emit("docatch","docatch");
        }
    },
    
    doPlayCards:function(){
        if(this.ready()){
            let socket = this.socket();
            this.game.selectedcards.splice(0 , this.game.selectedcards.length) ;
            for(var i=0 ; i<this.pokercards.length ; i++){
                var card = this.pokercards[i] ;
                var temp = card.getComponent("BeiMiCard");
                if(temp.selected == true){
                    this.game.selectedcards.push(temp.card) ;
                }
            }
            socket.emit("doplaycards" , this.game.selectedcards.join());
        }
        this.lasttip = null ;
    },
    
    noCards:function(){
        if(this.ready()){
            let socket = this.socket();
            socket.emit("nocards","nocards");
        }
        this.lasttip = null ;
    },
    
    clean:function(){
        for(var inx = 0 ; inx<this.pokercards.length ; inx++){
            let pc = this.pokercards[inx] ;
            this.game.pokerpool.put(pc) ;
        }
        this.pokercards.splice(0 , this.pokercards.length ) ;
        for(var i=0 ; i<this.lastcards.length ; i++){
            this.game.minpokerpool.put(this.lastcards[i]);
        }

        this.lastcards.splice( 0 , this.lastcards.length) ;

        for(var i = 0 ; i < this.player.length ; i++){
            var player = this.player[i].getComponent("PlayerRender") ;
            player.clean(this.game);
        }
        this.player.splice(0 , this.player.length) ;

        this.game.clean(this);
        this.ratio.string = "15倍" ;
    },
    
    onCloseClick:function(){
        this.continuegamebtn.active = true ;
    },
    
    restart:function(command){
        this.game.restart();
        this.statictimer("正在匹配玩家" , 5) ;
        if(this.ready()){
            let socket = this.socket();
            socket.emit("restart" , command);
        }
    },
    
    continuegame:function(){
        this.continuegamebtn.active = false ;
        this.restart("begin");
    },
    
    statictimer:function(message , time){
        if (!this.waitting) {
            console.warn('[DizhuBegin.statictimer] waitting预制体为空，跳过');
            return;
        }
        var rootNode = this.root();
        if (!rootNode) {
            console.warn('[DizhuBegin.statictimer] root节点为空，跳过');
            return;
        }
        this.waittimer = cc.instantiate(this.waitting);
        if (this.waittimer) {
            this.waittimer.parent = rootNode;

            let timer = this.waittimer.getComponent("BeiMiTimer");
            if(timer){
                timer.init(message , time , this.waittimer);
            }
        }
    },
    
    onDestroy:function(){
        this.inited = false ;
        this.cleanmap();
        if(this.ready()){
            let socket = this.socket();
            socket.emit("leave","leave");
        }
    },
    
    ensureGameBtnBinding: function() {
        console.log('[DizhuBegin] 确保按钮绑定...');
        
        if (!this.gamebtn) {
            this.gamebtn = cc.find('Canvas/global/main/game');
            console.log('[DizhuBegin] 自动绑定 gamebtn:', this.gamebtn);
        }
        
        if (this.gamebtn) {
            var self = this;
            this.gamebtn.on(cc.Node.EventType.TOUCH_END, function() {
                console.log('[DizhuBegin] TOUCH_END 事件触发（直接监听）');
                self.begin();
            }, this);
            console.log('[DizhuBegin] 已添加直接监听');
        }
    },
    
    restoreGlobalInteraction: function() {
        console.log('[DizhuBegin] 恢复全局交互...');
        
        var canvas = cc.find('Canvas');
        if (canvas) {
            canvas.active = true;
            canvas.opacity = 255;
            console.log('[DizhuBegin] Canvas 已恢复');
        }
        
        var maskNames = ['mask', 'blocker', 'overlay'];
        for (var i = 0; i < maskNames.length; i++) {
            var mask = cc.find('Canvas/' + maskNames[i]);
            if (mask) {
                mask.active = false;
                console.log('[DizhuBegin] 禁用遮罩:', maskNames[i]);
            }
        }
    }
});