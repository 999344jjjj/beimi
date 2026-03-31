package com.beimi.core.engine.game.task.dezhou;

import org.cache2k.expiry.ValueWithExpiryTime;

import com.beimi.core.BMDataContext;
import com.beimi.core.engine.game.BeiMiGameTask;
import com.beimi.core.engine.game.task.AbstractTask;
import com.beimi.web.model.GameRoom;

public class CreatePlayCardsTask extends AbstractTask implements ValueWithExpiryTime  , BeiMiGameTask{

	private long timer  ;
	private GameRoom gameRoom = null ;
	private String orgi ;
	private String player ;
	
	public CreatePlayCardsTask(long timer ,String userid, GameRoom gameRoom, String orgi){
		super();
		this.timer = timer ;
		this.gameRoom = gameRoom ;
		this.orgi = orgi ;
		this.player = userid ;
	}
	@Override
	public long getCacheExpiryTime() {
		return System.currentTimeMillis()+timer*1000;
	}
	
	public void execute(){
		BMDataContext.getGameEngine().takeCardsRequest(this.gameRoom.getId(), this.player, orgi,true,  null);
	}
}
