package com.beimi.util.rules.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.ArrayUtils;

import com.beimi.core.engine.game.ActionTaskUtils;
import com.beimi.core.engine.game.CardType;
import com.beimi.core.engine.game.Message;

public class TakeBullfightCards extends TakeCards implements Message , java.io.Serializable{

	private static final long serialVersionUID = 8718778983090104033L;
	
	private String banker ;
	private boolean allow ;
	private boolean donot ;
	private String userid ;
	private byte[] cards ;
	private long time ;
	private int type ;
	private CardType cardType ;
	private String command ;
	private boolean sameside ;
	private int cardsnum ;
	private String nextplayer ;
	
	public TakeBullfightCards(){}
	
	public TakeBullfightCards(Player player){
		this.userid = player.getPlayuser() ;
		this.cards = getAIMostSmall(player, 0) ;
		if(this.cards != null){
			player.setCards(this.removeCards(player.getCards() , cards));
			this.cardType =  ActionTaskUtils.identification(cards);
			if(this.cardType != null) {
				this.type = cardType.getCardtype() ;
			}
		}
		this.allow = true ;
		this.cardsnum = player.getCards().length ;
	}
	
	public TakeBullfightCards(Player player , TakeCards last){
		this(player, last, true) ;
	}
	
	public TakeBullfightCards(Player player , TakeCards last , boolean take){
		this.userid = player.getPlayuser() ;
		if(last != null){
			this.cards = this.search(player, last) ;
		}else{
			this.cards = getAIMostSmall(player, 0) ;
		}
		if(cards!=null){
			if(take == true){
				player.setCards(this.removeCards(player.getCards() , cards));
			}
			this.allow = true ;
			this.cardType =  ActionTaskUtils.identification(cards);
			if(this.cardType != null) {
				this.type = cardType.getCardtype() ;
			}
		}
		this.cardsnum = player.getCards().length ;
	}
	
	public TakeBullfightCards(Player player , boolean allow , byte[] playCards){
		this.userid = player.getPlayuser() ;
		if(playCards == null){
			this.cards = getAIMostSmall(player, 0) ;
		}else{
			this.cards = playCards ;
		}
		if(this.cards!=null){
			player.setCards(this.removeCards(player.getCards() , this.cards));
			this.cardType =  ActionTaskUtils.identification(cards);
			if(this.cardType != null) {
				this.type = cardType.getCardtype() ;
			}
		}
		this.cardsnum = player.getCards().length ;
		this.allow = true;
	}
	
	public TakeBullfightCards(Player player , byte[] tipcards){
		this.userid = player.getPlayuser() ;
		this.cards = tipcards ;
		if(this.cards!=null){
			this.cardType =  ActionTaskUtils.identification(cards);
			if(this.cardType != null) {
				this.type = cardType.getCardtype() ;
			}
		}
		this.cardsnum = player.getCards().length ;
		this.allow = true;
	}
	
	public byte[] search(Player player , TakeCards lastTakeCards){
		byte[] retValue = null ;
		Map<Integer,Integer> types = ActionTaskUtils.type(player.getCards()) ;
		if(lastTakeCards!=null && lastTakeCards.getCardType()!=null){
			switch(lastTakeCards.getCardType().getCardtype()){
				case 1 :
					retValue = this.getSingle(player.getCards(), types, lastTakeCards.getCardType().getMaxcard(), 1) ;
					break ;
				case 2 :
					retValue = this.getPair(player.getCards(), types, lastTakeCards.getCardType().getMaxcard() ,1) ;
					break ;
				case 3 :
					retValue = this.getThree(player.getCards(), types, lastTakeCards.getCardType().getMaxcard() ,1) ;
					break ;
			}
		}
		return retValue ;
	}

	public byte[] getPair(byte[] cards , Map<Integer,Integer> types , int mincard , int num ){
		byte[] retCards = null;
		List<Integer> retValue = new ArrayList<Integer>();
		for(int i=0 ; i<14 ; i++){
			if(types.get(i) != null && types.get(i) == 2  && retValue.size() < num && (i<0 || i>mincard)){
				retValue.add(i) ;
			}
			if(retValue.size() >= num){
				break ;
			}
		}
		if(retValue.size() == num){
			retCards = new byte[num*2] ;
			int inx = 0 ;
			for(int temp : retValue){
				int times = 0 ;
				for(byte card : cards){
					if(card/4 == temp){
						retCards[inx++] = card ;
						times++;
					}
					if(times == 2){
						break ;
					}
				}
			}
		}
		return retCards ;
	}

	public byte[] getSingle(byte[] cards, Map<Integer,Integer> types , int mincard ,int num ){
		byte[] retCards = null;
		List<Integer> retValue = new ArrayList<Integer>();
		for(int i=0 ; i<14 ; i++){
			if(types.get(i) != null && types.get(i) ==1  && retValue.size() < num && (i>mincard || i == 13)){
				retValue.add(i) ;
			}
			if(retValue.size() >= num){
				break ;
			}
		}
		if(retValue.size() == num){
			retCards = new byte[num] ;
			int inx = 0 ;
			for(int temp : retValue){
				for(byte card : cards){
					if(temp == 13 && mincard == 13){
						if(card == 53){
							retCards[inx++] = card ;
						}
					}else{
						if(card/4 == temp){
							retCards[inx++] = card ;
						}
					}
					if(inx >= num){
						break ;
					}
				}
			}
			if(inx == 0){
				retCards = null ;
			}
		}
		return retCards ;
	}

	public byte[] getThree(byte[] cards , Map<Integer,Integer> types , int mincard , int num){
		byte[] retCards = null;
		List<Integer> retValue = new ArrayList<Integer>();
		for(int i=0 ; i<14 ; i++){
			if(types.get(i) != null && types.get(i) == 3  && retValue.size() < num && (i<0 || i>mincard)){
				retValue.add(i) ;
			}
			if(retValue.size() >= num){
				break ;
			}
		}
		if(retValue.size() == num){
			retCards = new byte[num*3] ;
			int inx = 0 ;
			for(int temp : retValue){
				int times = 0 ;
				for(byte card : cards){
					if(card/4 == temp){
						retCards[inx++] = card ;
						times++;
					}
					if(times == 3){
						break ;
					}
				}
			}
		}
		return retCards ;
	}
	
	public byte[] getAIMostSmall(Player player , int start){
		Map<Integer,Integer> types = ActionTaskUtils.type(player.getCards()) ;
		int value = getMinCards(types , false) ;
		if(value < 0 ){
			value = getMinCards(types , true) ;
		}
		int num = types.get(value) ;
		byte[] takeCards = getSubCards(player.getCards(), value, num);
		return takeCards;
	}

	private int getMinCards(Map<Integer,Integer> types , boolean includebang){
		int value = -1 ;
		for(int i=0 ; i<14 ; i++){
			if(types.get(i) != null){
				if(includebang){
					value = i ;
				}else if(types.get(i) != 4 && i != 13){
					value = i ;
				}
				break ;
			}
		}
		return value ;
	}
	
	private byte[] getSubCards(byte[] cards,int value,int num){
		byte[] takeCards = new byte[num];
		int index = 0 ;
		for(int i=0 ; i<cards.length ; i++){
			if(cards[i]/4 == value){
				takeCards[index++] = cards[i] ;
			}
		}
		return takeCards ;
	}
	
	public byte[] getMostSmall(Player player, int start ){
		byte[] takeCards = null;
		if(player.getCards().length>0){
			takeCards = ArrayUtils.subarray(player.getCards(),player.getCards().length - 1,player.getCards().length) ;
			player.setCards(this.removeCards(player.getCards(), player.getCards().length - 1,player.getCards().length));
		}
		return takeCards ;
	}
	
	public byte[] removeCards(byte[] cards , int start , int end){
		byte[] retCards = new byte[cards.length - (end - start)] ;
		int inx = 0 ;
		for(int i=0; i<cards.length ; i++){
			if(i<start || i >= end){
				retCards[inx++] = cards[i] ;
			}
		}
		return retCards ;
	}
	
	public byte[] removeCards(byte[] cards , byte[] playcards){
		List<Byte> tempArray = new ArrayList<Byte>();
		for(int i=0; i<cards.length ; i++){
			boolean found = false ;
			for(int inx = 0 ;inx<playcards.length ; inx++){
				if(cards[i] == playcards[inx]){
					found = true ; break ;
				}
			}
			if(found == false){
				tempArray.add(cards[i]);
			}
		}
		byte[] retCards = new byte[tempArray.size()] ;
		for(int i=0 ; i<tempArray.size() ; i++){
			retCards[i] = tempArray.get(i) ;
		}
		return retCards ;
	}

	public String getUserid() {
		return userid;
	}

	public void setUserid(String userid) {
		this.userid = userid;
	}

	public byte[] getCards() {
		return cards;
	}

	public void setCards(byte[] cards) {
		this.cards = cards;
	}

	public long getTime() {
		return time;
	}

	public void setTime(long time) {
		this.time = time;
	}

	public int getType() {
		return type;
	}

	public void setType(int type) {
		this.type = type;
	}

	public CardType getCardType() {
		return cardType;
	}

	public void setCardType(CardType cardType) {
		this.cardType = cardType;
	}

	public boolean isAllow() {
		return allow;
	}

	public void setAllow(boolean allow) {
		this.allow = allow;
	}

	public boolean isDonot() {
		return donot;
	}

	public void setDonot(boolean donot) {
		this.donot = donot;
	}

	public boolean isSameside() {
		return sameside;
	}

	public void setSameside(boolean sameside) {
		this.sameside = sameside;
	}

	public String getBanker() {
		return banker;
	}

	public void setBanker(String banker) {
		this.banker = banker;
	}

	public String getCommand() {
		return command;
	}

	public void setCommand(String command) {
		this.command = command;
	}

	public int getCardsnum() {
		return cardsnum;
	}

	public void setCardsnum(int cardsnum) {
		this.cardsnum = cardsnum;
	}

	public String getNextplayer() {
		return nextplayer;
	}

	public void setNextplayer(String nextplayer) {
		this.nextplayer = nextplayer;
	}
}