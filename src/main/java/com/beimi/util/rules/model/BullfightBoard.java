package com.beimi.util.rules.model;

import java.util.Arrays;
import java.util.List;

import org.apache.commons.lang.ArrayUtils;

import com.beimi.core.BMDataContext;
import com.beimi.core.engine.game.ActionTaskUtils;
import com.beimi.core.engine.game.BeiMiGameEvent;
import com.beimi.core.engine.game.CardType;
import com.beimi.core.engine.game.model.Summary;
import com.beimi.core.engine.game.model.SummaryPlayer;
import com.beimi.core.engine.game.pva.PVAOperatorResult;
import com.beimi.util.GameUtils;
import com.beimi.util.PvaTools;
import com.beimi.util.cache.CacheHelper;
import com.beimi.web.model.GamePlayway;
import com.beimi.web.model.GameRoom;
import com.beimi.web.model.PlayUserClient;

public class BullfightBoard extends Board implements java.io.Serializable{

	private static final long serialVersionUID = 6143646772231515350L;

	@Override
	public byte[] pollLastHands() {
		return null;
	}

	@Override
	public int calcRatio() {
		return 1;
	}

	@Override
	public TakeCards takeCards(Player player , String playerType, TakeCards current) {
		return new TakeBullfightCards(player);
	}
	
	public Player player(String userid){
		Player target = null ;
		for(Player temp : this.getPlayers()){
			if(temp.getPlayuser().equals(userid)){
				target = temp ; break ;
			}
		}
		return target ;
	}
	
	public int index(String userid){
		int index = 0;
		for(int i=0 ; i<this.getPlayers().length ; i++){
			Player temp = this.getPlayers()[i] ;
			if(temp.getPlayuser().equals(userid)){
				index = i ; break ;
			}
		}
		return index ;
	}
	
	public Player next(int index){
		Player catchPlayer = null;
		if(index == (this.getPlayers().length - 1)){
			index = -1 ;
		}
		for(int i = index + 1 ; i<this.getPlayers().length ; ){
			Player player = this.getPlayers()[i] ;
			if(player.isDocatch() == false){
				catchPlayer = player ;
				break ;
			}else if(player.isRandomcard()){
				break ;
			}else if(i == (this.getPlayers().length - 1)){
				i = 0; continue ;
			}
			i++ ;
		}
		return catchPlayer;
	}

	public Player nextPlayer(int index) {
		if(index == (this.getPlayers().length - 1)){
			index = 0 ;
		}else{
			index = index + 1 ;
		}
		return this.getPlayers()[index];
	}

	public TakeCards takecard( Player player , boolean allow , byte[] playCards) {
		return new TakeBullfightCards(player , allow , playCards);
	}
	
	public TakeCards takecard(Player player) {
		return new TakeBullfightCards(player);
	}
	
	public TakeCards takecard(Player player , TakeCards last) {
		return new TakeBullfightCards(player, last);
	}
	
	public TakeCards cardtip(Player player , TakeCards last) {
		return new TakeBullfightCards(player, last , false);
	}

	public TakeCards getCardTips(Player player , byte[] tipcards) {
		return new TakeBullfightCards(player , tipcards);
	}

	@Override
	public boolean isWin() {
		return false;
	}

	@Override
	public TakeCards takeCardsRequest(GameRoom gameRoom , Board board, Player player,
			String orgi, boolean auto, byte[] playCards) {
		TakeCards takeCards = null ;
		boolean automic = false ;
		if((auto == true || playCards != null)){
			takeCards = board.takecard(player , true , playCards) ;
		}else{
			takeCards = new TakeBullfightCards();
			takeCards.setUserid(player.getPlayuser());
		}
		if(takeCards!=null){
			takeCards.setCardsnum(player.getCards().length);
			takeCards.setAllow(true);
			if(takeCards.getCards()!=null){
				Arrays.sort(takeCards.getCards());
			}
			if(takeCards.getCards()!=null){
				board.setLast(takeCards);
				takeCards.setDonot(false);
			}else{		
				takeCards.setDonot(true);
			}
			Player next = board.nextPlayer(board.index(player.getPlayuser())) ;
			if(next!=null){
				takeCards.setNextplayer(next.getPlayuser());
				board.setNextplayer(new NextPlayer(next.getPlayuser(), false));
				takeCards.setAutomic(automic);
			}
			CacheHelper.getBoardCacheBean().put(gameRoom.getId(), board, gameRoom.getOrgi());
			CacheHelper.getExpireCache().remove(gameRoom.getRoomid());
			ActionTaskUtils.sendEvent("takecards", takeCards , gameRoom);	
		}else{
			takeCards = new TakeBullfightCards();
			takeCards.setAllow(false);
			ActionTaskUtils.sendEvent("takecards", takeCards , gameRoom);	
		}
		return takeCards;
	}

	@Override
	public void dealRequest(GameRoom gameRoom, Board board, String orgi , boolean reverse, String nextplayer) {
	}

	@Override
	public void playcards(Board board, GameRoom gameRoom, Player player,
			String orgi) {
	}

	@Override
	public Summary summary(Board board, GameRoom gameRoom , GamePlayway playway) {
		Summary summary = new Summary(gameRoom.getId() , board.getId() , board.getRatio() , board.getRatio() * playway.getScore());
		List<PlayUserClient> players = CacheHelper.getGamePlayerCacheBean().getCacheObject(gameRoom.getId(), gameRoom.getOrgi()) ;
		boolean gameRoomOver = false ;
		
		for(Player player : board.getPlayers()){
			PlayUserClient playUser = getPlayerClient(players, player.getPlayuser());
			SummaryPlayer summaryPlayer = new SummaryPlayer(player.getPlayuser() , playUser.getUsername() , board.getRatio() , board.getRatio() * playway.getScore() , false , false) ;
			summaryPlayer.setCards(player.getCards());
			summary.getPlayers().add(summaryPlayer) ;
		}
		summary.setGameRoomOver(gameRoomOver);
		return summary;
	}
}