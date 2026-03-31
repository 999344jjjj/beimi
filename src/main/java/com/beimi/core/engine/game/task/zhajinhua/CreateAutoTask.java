package com.beimi.core.engine.game.task.zhajinhua;

import java.util.List;

import org.apache.commons.lang3.StringUtils;

import com.beimi.core.BMDataContext;
import com.beimi.core.engine.game.ActionTaskUtils;
import com.beimi.core.engine.game.BeiMiGameEvent;
import com.beimi.core.engine.game.BeiMiGameTask;
import com.beimi.core.engine.game.GameBoard;
import com.beimi.core.engine.game.task.AbstractTask;
import com.beimi.util.cache.CacheHelper;
import com.beimi.util.rules.model.ZhajinhuaBoard;
import com.beimi.util.rules.model.Player;
import com.beimi.web.model.GameRoom;
import com.beimi.web.model.PlayUserClient;

public class CreateAutoTask extends AbstractTask implements BeiMiGameTask{

	private long timer  ;
	private GameRoom gameRoom = null ;
	private String orgi ;
	
	public CreateAutoTask(long timer , GameRoom gameRoom, String orgi){
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
		ZhajinhuaBoard board = (ZhajinhuaBoard) CacheHelper.getBoardCacheBean().getCacheObject(gameRoom.getId(), gameRoom.getOrgi());
		Player currentPlayer = null;
		int index = 0 ;
		if(board!=null){
			for(int i=0 ; i<board.getPlayers().length ; i++){
				Player player = board.getPlayers()[i] ;
				if(player.isRandomcard()){
					currentPlayer = player ;
					index = i;
					break ;
				}
			}
			if(currentPlayer.isDocatch()){
				currentPlayer = board.nextPlayer(index);
			}
		}
		if(currentPlayer!=null){
			currentPlayer.setDocatch(true);
			sendEvent("catch", new GameBoard(currentPlayer.getPlayuser() , board.isDocatch() , currentPlayer.isAccept() , board.getRatio()), gameRoom) ;
			
			boolean isNormal = true ;
			List<PlayUserClient> users = CacheHelper.getGamePlayerCacheBean().getCacheObject(gameRoom.getId(), orgi) ;
			for(PlayUserClient playUser : users){
				if(currentPlayer.getPlayuser().equals(playUser.getId())){
					if(!playUser.getPlayertype().equals(BMDataContext.PlayerTypeEnum.NORMAL.toString())){
						isNormal = false ;
						currentPlayer.setAccept(true);
						currentPlayer.setDocatch(true);
						board.setDocatch(true);
						board.setBanker(currentPlayer.getPlayuser());
						break ;
					}
				}
			}
			
			if(isNormal){
				super.getGame(gameRoom.getPlayway(), orgi).change(gameRoom , BeiMiGameEvent.AUTO.toString() , 17);
			}else{
				sendEvent("catchresult", new GameBoard(currentPlayer.getPlayuser() , currentPlayer.isAccept(), currentPlayer.isAccept() , board.getRatio()) , gameRoom) ;
				super.getGame(gameRoom.getPlayway(), orgi).change(gameRoom , BeiMiGameEvent.AUTO.toString() , 2);
				board.setDocatch(true);
			}
			
			CacheHelper.getBoardCacheBean().put(gameRoom.getId(), board, orgi);
		}else{
			super.getGame(gameRoom.getPlayway(), orgi).change(gameRoom , BeiMiGameEvent.RAISEHANDS.toString());
		}
	}
}
