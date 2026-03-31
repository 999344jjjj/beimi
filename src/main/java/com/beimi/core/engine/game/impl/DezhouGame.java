package com.beimi.core.engine.game.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;

import org.apache.commons.lang.StringUtils;

import com.beimi.core.engine.game.iface.ChessGame;
import com.beimi.util.GameUtils;
import com.beimi.util.rules.model.Board;
import com.beimi.util.rules.model.DezhouBoard;
import com.beimi.util.rules.model.Player;
import com.beimi.web.model.GamePlayway;
import com.beimi.web.model.GameRoom;
import com.beimi.web.model.PlayUserClient;

public class DezhouGame implements ChessGame{
	
	public Board process(List<PlayUserClient> playUsers, GameRoom gameRoom, GamePlayway playway, String banker, int cardsnum){
		gameRoom.setCurrentnum(gameRoom.getCurrentnum() + 1);
		Board board = new DezhouBoard() ;
		board.setCards(null);
		List<Byte> temp = new ArrayList<Byte>() ;
		for(int i= 0 ; i<54 ; i++){
			temp.add((byte)i) ;
		}
		for(int i = 0 ; i<playway.getShuffletimes() + 1; i++){
			Collections.shuffle(temp);
		}
		
		byte[] cards = new byte[54] ;
		for(int i=0 ; i<temp.size() ; i++){
			cards[i] = temp.get(i) ;
		}
		
		board.setCards(cards);
		board.setRatio(1);
		int random = playUsers.size() * gameRoom.getCardsnum() ;
		board.setPosition((byte)new Random().nextInt(random));
		
		Player[] players = new Player[playUsers.size()];
		
		int inx = 0 ;
		for(PlayUserClient playUser : playUsers){
			Player player = new Player(playUser.getId()) ;
			player.setCards(new byte[cardsnum]);
			players[inx++] = player ;
		}
		
		for(int i = 0 ; i<gameRoom.getCardsnum()*gameRoom.getPlayers(); i++){
			int pos = i%players.length ; 
			players[pos].getCards()[i/players.length] = cards[i] ;
			if(i == board.getPosition()){
				players[pos].setRandomcard(true);
			}
		}
		
		for(Player tempPlayer : players){
			Arrays.sort(tempPlayer.getCards());
			tempPlayer.setCards(GameUtils.reverseCards(tempPlayer.getCards()));
		}
		
		board.setRoom(gameRoom.getId());
		Player tempbanker = players[0];
		if(!StringUtils.isBlank(banker)){
			for(int i= 0 ; i<players.length ; i++){
				Player player = players[i] ;
				if(player.equals(banker)){
					if(i < (players.length - 1)){
						tempbanker = players[i+1] ;
					}
				}
			}
			
		}
		board.setPlayers(players);
		if(tempbanker!=null){
			board.setBanker(tempbanker.getPlayuser());
		}
		
		return board;
	}

}