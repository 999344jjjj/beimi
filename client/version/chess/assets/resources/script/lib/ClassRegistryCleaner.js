// ============================================================================
// beimi 项目类注册清理器 - Cocos Creator 编辑器兼容版
// 处理 Cocos Creator 类注册表中的重复类问题
// ============================================================================
(function() {
    'use strict';

    var CONFIG = {
        gameClassNames: [
            'DiZhuSummaryClick', 'DizhuBegin', 'DizhuButton', 'DizhuDataBind',
            'GameMenu', 'PlayPoker', 'SelectColor', 'SummaryDetail'
        ],
        debug: true
    };

    function log(msg) {
        if (CONFIG.debug && cc.log) {
            cc.log('[ClassRegistryCleaner] ' + msg);
        }
    }

    function isGameClass(className) {
        if (!className) return false;
        for (var i = 0; i < CONFIG.gameClassNames.length; i++) {
            if (className === CONFIG.gameClassNames[i]) return true;
        }
        return false;
    }

    function clearAllGameClasses() {
        var clearedCount = 0;
        
        try {
            // 方法 1: 尝试清理 cc._Class._idToClass
            if (typeof cc._Class !== 'undefined' && cc._Class._idToClass) {
                for (var i = 0; i < CONFIG.gameClassNames.length; i++) {
                    var className = CONFIG.gameClassNames[i];
                    if (cc._Class._idToClass[className]) {
                        delete cc._Class._idToClass[className];
                        log('已清理类 (cc._Class._idToClass): ' + className);
                        clearedCount++;
                    }
                }
            }

            // 方法 2: 尝试清理 cc.js._registeredClassByName
            if (typeof cc.js !== 'undefined' && cc.js._registeredClassByName) {
                for (var j = 0; j < CONFIG.gameClassNames.length; j++) {
                    var name = CONFIG.gameClassNames[j];
                    if (cc.js._registeredClassByName[name]) {
                        delete cc.js._registeredClassByName[name];
                        log('已清理类 (cc.js._registeredClassByName): ' + name);
                        clearedCount++;
                    }
                }
            }

            // 方法 3: 尝试清理 cc.js._registeredClassById
            if (typeof cc.js !== 'undefined' && cc.js._registeredClassById) {
                for (var k = 0; k < CONFIG.gameClassNames.length; k++) {
                    var idName = CONFIG.gameClassNames[k];
                    if (cc.js._registeredClassById[idName]) {
                        delete cc.js._registeredClassById[idName];
                        log('已清理类 (cc.js._registeredClassById): ' + idName);
                        clearedCount++;
                    }
                }
            }
        } catch (e) {
            log('清理类时发生错误: ' + e.message);
        }
        
        log('类清理完成，共尝试清理 ' + clearedCount + ' 个类');
        return clearedCount;
    }

    // 保存原始的 cc.Class
    var originalCCClass = cc.Class;

    // 重写 cc.Class 来处理重复类名
    cc.Class = function(className, options) {
        // 如果是重复的游戏类，先清理
        if (typeof className === 'string' && isGameClass(className)) {
            try {
                clearAllGameClasses();
            } catch (e) {}
        }
        
        // 调用原始的 cc.Class
        return originalCCClass.apply(this, arguments);
    };

    // 复制静态属性
    for (var key in originalCCClass) {
        if (originalCCClass.hasOwnProperty(key)) {
            cc.Class[key] = originalCCClass[key];
        }
    }

    window.clearGameClasses = clearAllGameClasses;
    window.ClassRegistryCleaner = {
        clear: clearAllGameClasses,
        isGameClass: isGameClass,
        config: CONFIG
    };

    log('已加载（Cocos Creator 编辑器兼容版）');
})();
