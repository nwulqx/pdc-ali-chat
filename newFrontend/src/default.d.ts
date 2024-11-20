declare module '*.module.scss' {
  const content: { [className: string]: string };
  export = content;
}

declare module '*';
declare const APP_VERSION: string;

// 通用返回接口
declare namespace API {
  interface Result<T> {
    code: string;
    message: string;
    data: T;
    // 分页数据
    pageNum?: number;
    pageSize?: number;
    pages?: number;
    total?: number;
    count?: number;
    error?: string;
  }
}

interface Window {
  SockJS: any;
  Stomp: any;
  global: any;
  [key: string]: any;
}

