import pdcLogo from "@/assets/images/pdc_logo.png";
import porscheLogo from "@/assets/images/porsche_logo.png";

export const TOAST_ICONS_MAP = {
  success: "icon-xiugaichenggong",
  error: "icon-error",
  warning: "icon-tishi",
  loading: "icon-loading",
};

export const placeholderImg =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAABdJREFUKFNjZCASMBKpjmFUId6QIjp4AAppAAuXjCs4AAAAAElFTkSuQmCC";

export const DEFAULT_LANGUAGE = "zh";
export const DEFAULT_INPUT_FUNCS = [
  { title: "文本问答", type: "text_chat", code: "text_chat" },
  // { title: "文档解析", type: "doc_chat", code: "doc_chat" },
  // { title: "表格问答", type: "text_chat", code: "table_chat" },
];
export const DEFAULT_PAGE_CONFIG = {
  headerLogo: pdcLogo,
  content: {
    logo: pdcLogo,
    guideText: "你好，我是保时捷车载智能助手",
  },
  answer: {
    logo: porscheLogo,
  },
  textRecommends: [
    {
      showData:
        "让我为您的驾驶之旅增添色彩，只需告诉我您的喜好，即可营造出匹配的灯光效果。",
      contentData: "我正在听摇滚乐，帮我打造一个合适的氛围。",
      // iconUrl:
      //   "https://img.alicdn.com/imgextra/i4/O1CN01oQiXDF1mn8RoGCZyH_!!6000000004998-55-tps-20-20.svg",
      title: "氛围光影定制",
    },
    {
      showData:
        "我将深入理解您的驾驶需求和环境变化，为您推荐独具保时捷风格的驾驶设定。",
      contentData: "外面开始下雨，我应该如何调整驾驶模式？",
      // iconUrl:
      // "https://img.alicdn.com/imgextra/i4/O1CN01oQiXDF1mn8RoGCZyH_!!6000000004998-55-tps-20-20.svg",
      title: "智享驾驶建议",
    },
    {
      showData:
        "我将根据您的目的地和个人偏好定制行程，并结合保时捷特色功能，提供专业驾驶建议。",
      contentData: "帮我规划一个从杭州东站自驾到西湖的路线",
      // iconUrl:
      //   "https://img.alicdn.com/imgextra/i4/O1CN01oQiXDF1mn8RoGCZyH_!!6000000004998-55-tps-20-20.svg",
      title: "行程规划向导",
    },
    {
      showData: "深入了解保时捷品牌故事和历史传承，感受背后的灵感与创新。",
      contentData: "给我讲讲Macan这个名字的由来",
      // iconUrl:
      //   "https://img.alicdn.com/imgextra/i4/O1CN01oQiXDF1mn8RoGCZyH_!!6000000004998-55-tps-20-20.svg",
      title: "品牌故事探索",
    },
  ],
  footerDesc: "技术支持由阿里云通义千问提供",
};

export const darkTheme = {
  "--primary-color": "#434343",
  "--answer-bg-color": "#878AAB",
  "--primary-color-2": "#434343",
  "--primary-button-bg": "#434343",
  "--primary-button-hover-bg": "#434343",
  "--primary-text-color": "#434343",
  "--text-gray-1": "#3f3f3f",
  "--module-bg": "#F7F7F7",
  "--description-color": "#888",
  "--description-text-color": "#bbb",
  "--gradient-border-color": "#434343",
  "--gradient-bg-color": "#fff",
  "--prompt-hover-bg": "transparent",
  "--prompt-hover-before-bg": "#F0F0F0",
  "--button-disabled-bg": "#dcdcdc",
  "--border-hover-color": "#F0F0F0",
  "--border-shadow-color": "rgba(#bbb, .2)",
  "--send-btn-bg": "#434343",
  "--mobile-button-disabled-bg": "rgba(#888, 0.24)",
  "--mobile-button-disabled-color": "rgba(63, 63, 63, 0.5)",
  "--mobile-button-focus-bg": "#434343",
  "--mobile-question-bg": "#434343",
  "--mobile-question-color": "#fff",
  "--markdown-table-tr-border-color": "rgba(0, 0, 0, .08)",
};

export const primaryTheme = {
  "--primary-color": "#615ced",
  "--answer-bg-color": "#615ced",
  "--primary-color-2": "#624aff",
  "--primary-button-bg": "linear-gradient(75deg, #615ced -8%, #3e2fa7 181%)",
  "--primary-button-hover-bg":
    "linear-gradient(79deg, #746ff4 0%, #3820d9 181%)",
  "--primary-text-color": "#26244c",
  "--text-gray-1": "#3f3f3f",
  "--module-bg": "#f7f8fc",
  "--description-color": "rgba(135, 138, 171, 0.8)",
  "--description-text-color": "#878aab",
  "--gradient-border-color": `conic-gradient(
    from 90deg at 50% 50%,
    #624aff 0deg,
    #624aff 3deg,
    #6202a6 123deg,
    #d877fd 242deg,
    #624aff 360deg,
    #624aff 363deg
  )`,
  "--gradient-bg-color": "#fff",
  "--prompt-hover-bg": "rgba(97, 92, 237, 0.06)",
  "--prompt-hover-before-bg": "#fff",
  "--border-hover-color": "rgba(195, 197, 217, 0.65)",
  "--border-shadow-color": "rgba(115, 110, 240, 0.1)",
  "--button-disabled-bg": "#dcdcdc",
  "--send-btn-bg": "linear-gradient(47deg, #615ced 0%, #3e2fa7 176%)",
  "--mobile-button-disabled-bg": "rgba(135, 138, 171, 0.24)",
  "--mobile-button-disabled-color": "rgba(63, 63, 63, 0.5)",
  "--mobile-button-focus-bg":
    "linear-gradient(68deg, #615ced 0%, #3e2fa7 180%)",
  "--mobile-question-bg": "linear-gradient(75deg, #615ced -3%, #3e2fa7 249%)",
  "--mobile-question-color": "#fff",
  "--markdown-table-tr-border-color": "rgba(0, 0, 0, .08)",
};

export const changeTheme = (themeObj: Record<string, string>) => {
  const bodyStyle = document.body.style;

  Object.keys(themeObj).map((itemKey) => {
    bodyStyle.setProperty(itemKey, themeObj[itemKey]);
  });
};

export const changeMetaIcon = (iconUrl: string) => {
  const link = document.querySelector("link[rel='shortcut icon']");
  if (!link) return;
  link.href = iconUrl;
};
