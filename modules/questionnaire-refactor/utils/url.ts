/**
 * URL 工具函数
 * @description 提供 URL 相关的常用工具函数
 */

/**
 * 解析 URL 查询参数
 * @param query - 查询字符串或对象
 * @returns 解析后的对象
 * 
 * @example
 * ```ts
 * const params = parseQuery('a=1&b=2');
 * console.log(params); // { a: '1', b: '2' }
 * 
 * const decoded = deQueryForUrl({ a: 'test%20value' });
 * console.log(decoded); // { a: 'test value' }
 * ```
 */
export function deQueryForUrl<T = Record<string, unknown>>(query: unknown): T {
  // 如果是字符串，解析为对象
  if (typeof query === 'string') {
    const result: Record<string, unknown> = {};
    const params = new URLSearchParams(query);
    
    params.forEach((value, key) => {
      try {
        // 尝试解码
        result[key] = decodeURIComponent(value);
      } catch {
        result[key] = value;
      }
    });
    
    return result as T;
  }
  
  // 如果是对象，递归解码
  if (typeof query === 'object' && query !== null) {
    const result: Record<string, unknown> = {};
    
    Object.entries(query).forEach(([key, value]) => {
      if (typeof value === 'string') {
        try {
          result[key] = decodeURIComponent(value);
        } catch {
          result[key] = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        result[key] = deQueryForUrl(value);
      } else {
        result[key] = value;
      }
    });
    
    return result as T;
  }
  
  return query as T;
}

/**
 * 构建 URL 查询字符串
 * @param params - 参数对象
 * @returns 查询字符串
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
}
