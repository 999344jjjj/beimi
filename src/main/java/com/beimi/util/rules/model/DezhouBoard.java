package com.beimi.util.rules.model;

import java.util.Arrays;
import java.util.List;

import org.apache.commons.lang.ArrayUtils;

import com.beimi.core.BMDataContext;
import com.beimi.core.engine.game.ActionTaskUtils;
import com.beimi.core.engine.game.BeiMiGameEvent;
import com.beimi.core.engine.game.model.Summary;
import com.beimi.core.engine.game.model.SummaryPlayer;
import com.beimi.core.engine.game.pva.PVAOperatorResult;
import com.beimi.util.PvaTools;
import com.beimi.util.cache.CacheHelper;
import com.beimi.web.model.GamePlayway;
import com.beimi.web.model.GameRoom;
import com.beimi.web.model.PlayUserClient;

public class DezhouBoard extends Board implements java.io.Serializable{

	private static final long serialVersionUID = 1L;
	
	private byte[] communityCards;

	@Override
	public byte[] pollLastHands() {
		return ArrayUtils.subarray(this.getCards() , this.getCards().length - 5 , this.getCards() .length);
	}

	@Override
	public int calcRatio() {
		return 1;
	}

	@Override
	public TakeCards takeCards(Player player , String playerType, TakeCards current) {
		return new TakeDezhouCards(player);
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
		if(index == (this.getPlayers().length - 1)){
			index = -1 ;
		}
		for(int i = index + 1 ; i<this.getPlayers().length ; ){
			Player player = this.getPlayers()[i] ;
			return player;
		}
		return null;
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
		return new TakeDezhouCards(player , allow , playCards);
	}

	public TakeCards takecard(Player player) {
		return new TakeDezhouCards(player);
	}

	public TakeCards takecard(Player player , TakeCards last) {
		return new TakeDezhouCards(player, last);
	}

	@Override
	public boolean isWin() {
		boolean win = false ;
		if(this.getLast()!=null && this.getLast().getCardsnum() == 0){
			win = true ;
		}
		return win;
	}

	@Override
	public TakeCards takeCardsRequest(GameRoom gameRoom , Board board, Player player,
			String orgi, boolean auto, byte[] playCards) {
		TakeCards takeCards = null ;
		boolean automic = false ;
		if((auto == true || playCards != null)){
			if(board.getLast() == null || board.getLast().getUserid().equals(player.getPlayuser())){
				takeCards = board.takecard(player , true , playCards) ;
			}else{
				if(playCards == null){
					takeCards = board.takecard(player , board.getLast()) ;
				}else{
					takeCards = board.takecard(player , true , playCards) ;
				}
			}
		}else{
			takeCards = new TakeDezhouCards();
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

				if(board.getLast() != null && board.getLast().getUserid().equals(next.getPlayuser())){
					automic = true ;
				}
				takeCards.setAutomic(automic);
			}
			if(board.isWin()){
				board.setWinner(player.getPlayuser());
				takeCards.setOver(true);
			}
			if(takeCards.getCards()!=null && takeCards.getCards().length > 0){
				for(byte temp : takeCards.getCards()){
					board.getHistory().add(temp) ;
				}
			}
			
			CacheHelper.getBoardCacheBean().put(gameRoom.getId(), board, gameRoom.getOrgi());
			
			CacheHelper.getExpireCache().remove(gameRoom.getRoomid());
			
			ActionTaskUtils.sendEvent("takecards", takeCards , gameRoom);	
			
			if(board.isWin()){
				com.beimi.util.GameUtils.getGame(gameRoom.getPlayway() , orgi).change(gameRoom , BeiMiGameEvent.ALLCARDS.toString() , 0);
				takeCards.setNextplayer(null);
			}
		}else{
			takeCards = new TakeDezhouCards();
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
		
		boolean win = board.getWinner() != null;
		
		for(Player player : board.getPlayers()){
			PlayUserClient playUser = getPlayerClient(players, player.getPlayuser());
			SummaryPlayer summaryPlayer = new SummaryPlayer(player.getPlayuser() , playUser.getUsername() , board.getRatio() , board.getRatio() * playway.getScore() , false , player.getPlayuser().equals(board.getBanker())) ;
			
			if(player.getPlayuser().equals(board.getWinner())){
				summaryPlayer.setWin(true);
				PVAOperatorResult result = PvaTools.getGoldCoins().income(playUser, BMDataContext.PVAInComeActionEnum.WIN.toString(), summaryPlayer.getScore()) ;
				summaryPlayer.setBalance(result.getBalance());
			}else{
				if(playUser.getGoldcoins() <= summaryPlayer.getScore()){
					summaryPlayer.setScore(playUser.getGoldcoins());
				}
				PVAOperatorResult result = PvaTools.getGoldCoins().consume(playUser , BMDataContext.PVAConsumeActionEnum.LOST.toString(), summaryPlayer.getScore()) ;
				summaryPlayer.setBalance(result.getBalance());
			}
			summaryPlayer.setCards(player.getCards());
			summary.getPlayers().add(summaryPlayer) ;
		}
		
		return summary;
	}

	public byte[] getCommunityCards() {
		return communityCards;
	}

	public void setCommunityCards(byte[] communityCards) {
		this.communityCards = communityCards;
	}
}
