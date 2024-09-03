// 判断字符是否为标点符号的函数
export function isPunctuation(char: string) {
  const punctuationRegex = /[\p{P}\p{S}]/u;
  return punctuationRegex.test(char);
}
