/**
 * 从HTML内容中提取纯文本
 * @param html HTML字符串
 * @returns 纯文本字符串
 */
export function extractTextFromHtml(html: string): string {
  // 移除所有HTML标签
  const textContent = html.replace(/<[^>]*>/g, '');
  
  // 解码HTML实体 (如 &amp; &lt; &gt; 等)
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = textContent;
  
  return tempDiv.textContent || tempDiv.innerText || '';
}

/**
 * 从HTML内容中提取纯文本摘要
 * @param html HTML字符串
 * @param maxLength 最大长度
 * @returns 摘要文本
 */
export function extractTextSummary(html: string, maxLength: number = 150): string {
  const textContent = extractTextFromHtml(html).trim();
  
  if (textContent.length <= maxLength) {
    return textContent;
  }
  
  // 在单词边界处截断，避免截断单词
  let summary = textContent.substring(0, maxLength);
  const lastSpaceIndex = summary.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.8) {
    summary = summary.substring(0, lastSpaceIndex);
  }
  
  return summary + '...';
}

/**
 * 服务端安全的文本提取（不使用DOM API）
 * @param html HTML字符串
 * @param maxLength 最大长度
 * @returns 摘要文本
 */
export function extractTextSummarySSR(html: string, maxLength: number = 150): string {
  // 移除HTML标签
  let textContent = html.replace(/<[^>]*>/g, '');
  
  // 简单的HTML实体解码
  textContent = textContent
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
  
  if (textContent.length <= maxLength) {
    return textContent;
  }
  
  // 在单词边界处截断
  let summary = textContent.substring(0, maxLength);
  const lastSpaceIndex = summary.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.8) {
    summary = summary.substring(0, lastSpaceIndex);
  }
  
  return summary + '...';
}
