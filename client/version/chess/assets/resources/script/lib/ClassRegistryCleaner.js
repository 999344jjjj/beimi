// ============================================================================
// beimi 项目类注册清理器 - 最简安全版
// 不重写 cc.Class，只提供清理函数，由 BeiMiCommon.js 调用
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
        log('跳过类清理，避免场景脚本缺失问题');
        return 0;
    }

    window.clearGameClasses = clearAllGameClasses;
    window.ClassRegistryCleaner = {
        clear: clearAllGameClasses,
        isGameClass: isGameClass,
        config: CONFIG
    };

    log('已加载（不重写 cc.Class）');
})();
