import { defineAppConfig, definePageConfig } from 'ice';
import { insertMeta, isMobile, softKeyboardFit } from '@/libs/utils';
import 'antd/dist/antd.less';
import 'hacktimer';

import './lightStyle.less';

(function init(){
  if (process.env.NODE_ENV !== 'development') {
    window.console.log = () => {};
    window.console.warn = () => {};
  }

  // 禁止横屏
  try {
    if (isMobile()) {
      insertMeta('screen-orientation', 'portrait');
      insertMeta('x5-orientation', 'portrait');
      screen?.orientation?.lock('any');
    }
  } catch (e) {}

  // 适配软件盘
  softKeyboardFit();
})()

document.title = "对话页面模版";

export default defineAppConfig(() => ({
  router: {
    type: 'hash',
  },
  routes: {
    defineRoutes: (route) => {
      route('/index', 'index.tsx');
    },
  }
}));
