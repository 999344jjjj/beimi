package com.beimi.config.web;

import javax.annotation.Resource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.beimi.config.web.model.Game;
import com.beimi.core.statemachine.BeiMiStateMachine;
import com.beimi.core.statemachine.impl.BeiMiMachineHandler;

/**
 * 游戏状态机处理实现配置类
 *
 * @author
 *
 */
@Configuration
public class BeiMiStateMachineHandlerConfig {
	
	@Resource(name="dizhu")    
	private BeiMiStateMachine<String,String> dizhuConfigure ;
	
	@Resource(name="majiang")    
	private BeiMiStateMachine<String,String> maJiangConfigure ;
	
	@Resource(name="dezhou")    
	private BeiMiStateMachine<String,String> dezhouConfigure ;
	
	@Resource(name="bullfight")    
	private BeiMiStateMachine<String,String> bullfightConfigure ;
	
	@Resource(name="zhajinhua")    
	private BeiMiStateMachine<String,String> zhajinhuaConfigure ;
	
    @Bean("dizhuGame")
    public Game dizhu() {
        return new Game(new BeiMiMachineHandler(this.dizhuConfigure));
    }
    
    @Bean("majiangGame")
    public Game majiang() {
        return new Game(new BeiMiMachineHandler(this.maJiangConfigure));
    }
    
    @Bean("dezhouGame")
    public Game dezhou() {
        return new Game(new BeiMiMachineHandler(this.dezhouConfigure));
    }
    
    @Bean("bullfightGame")
    public Game bullfight() {
        return new Game(new BeiMiMachineHandler(this.bullfightConfigure));
    }
    
    @Bean("zhajinhuaGame")
    public Game zhajinhua() {
        return new Game(new BeiMiMachineHandler(this.zhajinhuaConfigure));
    }
}