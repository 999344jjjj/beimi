package com.beimi.core.engine.game.action.zhajinhua;

import org.apache.commons.lang3.StringUtils;

import com.beimi.core.BMDataContext;
import com.beimi.core.engine.game.task.zhajinhua.CreateRaiseHandsTask;
import com.beimi.core.statemachine.action.Action;
import com.beimi.core.statemachine.impl.BeiMiExtentionTransitionConfigurer;
import com.beimi.core.statemachine.message.Message;
import com.beimi.util.cache.CacheHelper;
import com.beimi.web.model.GameRoom;

public class RaiseHandsAction<T,S> implements Action<T, S>{

	@Override
	public void execute(Message<T> message, BeiMiExtentionTransitionConfigurer<T,S> configurer) {
		String room = (String)message.getMessageHeaders().getHeaders().get("room") ;
		if(!StringUtils.isBlank(room)){
			GameRoom gameRoom = (GameRoom) CacheHelper.getGameRoomCacheBean().getCacheObject(room, BMDataContext.SYSTEM_ORGI) ; 
			if(gameRoom!=null){
				CacheHelper.getExpireCache().put(gameRoom.getRoomid(), new CreateRaiseHandsTask(0 , gameRoom , gameRoom.getOrgi()));
			}
		}
	}
}
