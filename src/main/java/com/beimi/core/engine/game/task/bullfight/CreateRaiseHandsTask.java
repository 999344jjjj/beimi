package com.beimi.core.engine.game.task.bullfight;

import org.cache2k.expiry.ValueWithExpiryTime;

import com.beimi.core.BMDataContext;
import com.beimi.core.engine.game.ActionTaskUtils;
import com.beimi.core.engine.game.BeiMiGameEvent;
import com.beimi.core.engine.game.BeiMiGameTask;
import com.beimi.core.engine.game.GameBoard;
import com.beimi.core.engine.game.task.AbstractTask;
import com.beimi.util.cache.CacheHelper;
import com.beimi.util.rules.model.BullfightBoard;
import com.beimi.util.rules.model.NextPlayer;
import com.beimi.util.rules.model.Player;
import com.beimi.web.model.GameRoom;
import com.beimi.web.model.PlayUserClient;

public class CreateRaiseHandsTask extends AbstractTask implements ValueWithExpiryTime  , BeiMiGameTask{

	private long timer  ;
	private GameRoom gameRoom = null ;
	private String orgi ;
	
	public CreateRaiseHandsTask(long timer , GameRoom gameRoom, String orgi){
		super();
		this.timer = timer ;
		this.gameRoom = gameRoom ;
		this.orgi = orgi ;
	}
	@Override
	public long getCacheExpiryTime() {
		return System.currentTimeMillis()+timer*1000;
	}
	
	public void execute(){
		BullfightBoard board = (BullfightBoard) CacheHelper.getBoardCacheBean().getCacheObject(gameRoom.getId(), gameRoom.getOrgi());
		Player firstPlayer = null ;
		for(Player player : board.getPlayers()){
			if(player.getPlayuser().equals(board.getBanker())){
				board.setNextplayer(new NextPlayer(player.getPlayuser(), false));
				firstPlayer = player ;
				break ;
			}
		}
		board.setRatio(board.getRatio() * board.calcRatio());
		sendEvent("lasthands", new GameBoard(firstPlayer.getPlayuser() , board.getCards(), board.getRatio()) , gameRoom) ;
		CacheHelper.getBoardCacheBean().put(gameRoom.getId(), board, orgi);
		
		PlayUserClient playUserClient = ActionTaskUtils.getPlayUserClient(gameRoom.getId(), firstPlayer.getPlayuser(), orgi) ;
		
		if(BMDataContext.PlayerTypeEnum.NORMAL.toString().equals(playUserClient.getPlayertype())){
			super.getGame(gameRoom.getPlayway(), orgi).change(gameRoom , BeiMiGameEvent.PLAYCARDS.toString() , 25);
		}else{
			super.getGame(gameRoom.getPlayway(), orgi).change(gameRoom , BeiMiGameEvent.PLAYCARDS.toString() ,3);
		}
	}
}
