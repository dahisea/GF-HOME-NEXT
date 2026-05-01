const TARGET_HOST = 'sgejd-hdbidb-datanodeserver.dahi.edu.eu.org';
const CACHE_MAX_AGE = 360000; // 100 hours

// 获取敏感词列表
function getSensitiveWords() {
  try {
    const sensitiveWordsBase64 = 'WyLphbciLCLoipIiLCLniLEiLCLmhJsiLCLlk4AiLCLohb4iLCLpqLAiLCLmgrwiLCLnva7ngbAiLCLnlqsiLCLmnYAiLCLmrroiLCLlsLwiLCLlsYEiLCLpt4QiLCLpuKEiLCLnp5HlrbjkuIoiLCLnp5HlrabkuIoiLCLmnLrlnLoiLCLmqZ/loLQiLCLmmYLku6MiLCLml7bku6MiLCLmlrDkuJbnlYwiLCLmnIDmlrDlnLDlnYAiLCLnpoHlnLAiLCLku5jotLkiLCLku5josrsiLCLmr5IiLCLlubPlj7AiLCLlubPoh7oiLCLkuK3lhbEiLCLlhbHpnZIiLCLlrqPlgrMiLCLlrqPkvKAiLCLoiIYiLCLovL8iLCLmganmg4UiLCLmnJ3pspwiLCLmnJ3prq4iLCLkuK3lpK4iLCLkuK3oj68iLCLkuK3ljY4iLCLlhbHlkowiLCLkurrmsJEiLCLmlK/pgqMiLCLnurMiLCLntI0iLCLlv4PngbUiLCLnmociLCLluJ0iLCLnv7vnqIYiLCLnv7vnopkiLCLnv5Lov5HlubMiLCLkuaDov5HlubMiLCLljIXlrZAiLCLnu7TlsLwiLCLntq3lsLwiLCLlhpsiLCLou40iLCLmraYiLCLkuLvluK0iLCLnuL3ntbEiLCLmgLvnu58iLCLkuLvnvqkiLCLkuLvkuYkiLCLmgJ3mg7MiLCLlj7Dmub4iLCLlj7DngaMiLCLoh7rngaMiLCLnpL7mnIMiLCLnpL7kvJoiLCLmsJHkuLsiLCLmlL8iLCLoopYiLCLpoJgiLCLpooYiLCLlv6AiLCLnjK4iLCLnjbsiLCLkv5ciLCLmlrDnloYiLCLopb/ol48iLCLlnaYiLCLpnakiLCLovrEiLCLpoqAiLCLlhZoiLCLpu6giLCLpoZsiLCLlqIEiLCLmmrTlipsiLCLlha3lm5siLCLlhavkuZ3lha3lm5siLCLmjqjnv7siLCLms5Xova4iLCLms5XovKoiLCLlvovluIgiLCLlvovluKsiLCLlpKnlrokiLCLohZAiLCLmoq/lrZAiLCLojYnmprQiLCLlkKvnvp7ojYkiLCLmnIDmlrDlnLDlnYAiLCLmsLjkuYXpj4jmjqUiLCLmnIDmlrDpj4jmjqUiLCLmnIDmlrDntrLlnYAiLCLnmbzkvYjpoIEiLCLlm57lrrYiLCLmsLjkuYXlnLDlnYAiLCLku5josrsiLCLku5jotLkiLCLmlLbosrsiLCLmlLbotLkiLCLlj5HluIPpobUiLCLmnIDmlrDnvZHlnYAiLCLmnIDmlrDpk77mjqUiLCLmsLjkuYXpk77mjqUiLCLmtbfop5IiLCLlpKnmtq8iLCLkuqwiLCLljZfmtbciLCLpppnmuK8iLCLmvrMiLCLnlLgiLCLkuK3lm70iLCLkuK3lnIsiLCLlnIvnlKIiLCLlm73kuqciLCIiLCLmlrDmtaoiLCLpurvosYYiLCI4OTY0IiwiOTYxMTAiLCJ2MnJheSIsInRyb2phbiIsInZsZXNzIiwidm1lc3MiLCJ2cG4iXQ';
    const decoded = atob(sensitiveWordsBase64);
    return JSON.parse(decodeURIComponent(escape(decoded)));
  } catch (e) {
    console.error('Failed to decode sensitive words:', e);
    return [];
  }
}

// 替换敏感词
function replaceSensitiveWords(content, sensitiveWords) {
  if (!content || !Array.isArray(sensitiveWords) || sensitiveWords.length === 0) {
    return content;
  }
  
  const escapedWords = sensitiveWords
    .filter(word => word && word.length > 0)
    .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  
  if (escapedWords.length === 0) return content;
  
  const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
  
  return content.replace(regex, (match) => '＃'.repeat(match.length));
}

// 递归替换 JSON 对象中的敏感词
function replaceSensitiveWordsInObject(obj, sensitiveWords) {
  if (typeof obj === 'string') {
    return replaceSensitiveWords(obj, sensitiveWords);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => replaceSensitiveWordsInObject(item, sensitiveWords));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = replaceSensitiveWordsInObject(obj[key], sensitiveWords);
      }
    }
    return result;
  }
  
  return obj;
}

// Base64 编码函数
function base64Encode(str) {
  if (!str) return '';
  
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  
  let binary = '';
  const bytes = new Uint8Array(data);
  const len = bytes.byteLength;
  
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary);
}

// HTML 提取函数
function extractTitle(html) {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : '';
}

function extractHeader(html) {
  const headerMatch = html.match(/<header>([\s\S]*?)<\/header>/i);
  return headerMatch ? headerMatch[1].trim() : '';
}

function extractScriptMeta(html) {
  const metaMatch = html.match(/<div class="script-meta-block">([\s\S]*?)<\/div>/i);
  return metaMatch ? metaMatch[1].trim() : '';
}

function extractAdditionalInfo(html) {
  const infoMatch = html.match(/<div id="additional-info" class="user-content"[^>]*>([\s\S]*?)<\/div>/i);
  return infoMatch ? infoMatch[1].trim() : '';
}

function extractInstallLink(html) {
  const installMatch = html.match(/<a class="install-link" data-install-format="js"[^>]*href="([^"]+)"/i);
  return installMatch ? installMatch[1] : '';
}

function extractScriptDiscussionList(html) {
  const startPattern = /<div class="script-discussion-list">/i;
  const startMatch = html.match(startPattern);
  
  if (!startMatch) {
    return '';
  }
  
  const startIndex = startMatch.index + startMatch[0].length;
  
  // 查找结束位置：</div> 后跟若干空格/换行，然后是 <h3 id="post-discussion">
  const endPattern = /<\/div>\s*<h3 id="post-discussion">/i;
  const remainingHtml = html.substring(startIndex);
  const endMatch = remainingHtml.match(endPattern);
  
  if (!endMatch) {
    return '';
  }
  
  // 提取内容（不包括最后的 </div>）
  const endIndex = startIndex + endMatch.index;
  return html.substring(startIndex, endIndex).trim();
}

function findMatchingClosingTag(html, startPos) {
  let depth = 1;
  let pos = startPos;
  
  while (depth > 0 && pos < html.length) {
    const nextOpen = html.indexOf('<div', pos);
    const nextClose = html.indexOf('</div>', pos);
    
    if (nextClose === -1) {
      return null;
    }
    
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      pos = nextOpen + 4;
    } else {
      depth--;
      if (depth === 0) {
        return {
          endIndex: nextClose + 6
        };
      }
      pos = nextClose + 6;
    }
  }
  
  return null;
}

function extractComments(html) {
  const comments = [];
  let pos = 0;
  
  while (true) {
    const startPattern = /<div class="comment"[^>]*>/i;
    const startMatch = html.substring(pos).match(startPattern);
    
    if (!startMatch) break;
    
    const startIndex = pos + startMatch.index;
    const openTagEnd = startIndex + startMatch[0].length;
    
    const content = findMatchingClosingTag(html, openTagEnd);
    
    if (content !== null) {
      const fullComment = html.substring(startIndex, content.endIndex);
      comments.push(fullComment);
      pos = content.endIndex;
    } else {
      break;
    }
  }
  
  return comments;
}

// 提取 detail 页面数据
function extractDetailData(html) {
  const sensitiveWords = getSensitiveWords();
  
  const header = extractHeader(html);
  const scriptMeta = extractScriptMeta(html);
  const additionalInfo = extractAdditionalInfo(html);
  const installLink = extractInstallLink(html);
  
  return {
    title: replaceSensitiveWords(extractTitle(html), sensitiveWords),
    install: installLink,
    c1: base64Encode(replaceSensitiveWords(header, sensitiveWords)),
    c2: base64Encode(replaceSensitiveWords(scriptMeta, sensitiveWords)),
    c3: base64Encode(replaceSensitiveWords(additionalInfo, sensitiveWords))
  };
}

// 提取 feedback 页面数据
function extractFeedbackData(html) {
  const sensitiveWords = getSensitiveWords();
  
  const discussionList = extractScriptDiscussionList(html);
  
  return {
    title: replaceSensitiveWords(extractTitle(html), sensitiveWords),
    c1: base64Encode(replaceSensitiveWords(discussionList, sensitiveWords))
  };
}

// 提取 ugc 讨论页面数据
function extractUgcData(html) {
  const comments = extractComments(html);
  const sensitiveWords = getSensitiveWords();
  const result = {
    title: replaceSensitiveWords(extractTitle(html), sensitiveWords)
  };
  
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];
    result[`c${i + 1}`] = base64Encode(replaceSensitiveWords(comment, sensitiveWords));
  }
  
  return result;
}

// 主处理函数
async function handleRequest(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': `public, max-age=${CACHE_MAX_AGE}`,
    'CDN-Cache-Control': `public, max-age=${CACHE_MAX_AGE}`
  };

  try {
    const url = new URL(request.url);
    
    const scriptsMatch = url.pathname.match(/^\/info\/([a-z]{2}(?:-[A-Z]{2})?)\/scripts\/(\d+)\/(detail|feedback)\.json$/);
    const ugcMatch = url.pathname.match(/^\/info\/([a-z]{2}(?:-[A-Z]{2})?)\/ugc\/([^/]+)\/(\d+)\.json$/);
    const usersMatch = url.pathname.match(/^\/info\/([a-z]{2}(?:-[A-Z]{2})?)\/users\/(.+)\.json$/);
    
    if (!scriptsMatch && !ugcMatch && !usersMatch) {
      return new Response(JSON.stringify({
        error: 'Invalid URL format',
        expected: [
          '/info/{locale}/scripts/{id}/detail.json',
          '/info/{locale}/scripts/{id}/feedback.json',
          '/info/{locale}/ugc/{category}/{id}.json',
          '/info/{locale}/users/{user-id-and-name}.json'
        ],
        examples: [
          '/info/zh-CN/scripts/194967/detail.json',
          '/info/zh-TW/scripts/377497/feedback.json',
          '/info/en/ugc/development/123.json',
          '/info/en/users/1538106-freepentests-on-soundcloud.json'
        ]
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    
    let targetUrl, dataType;
    
    if (scriptsMatch) {
      const locale = scriptsMatch[1];
      const scriptId = scriptsMatch[2];
      const endpoint = scriptsMatch[3];
      
      dataType = endpoint;
      if (endpoint === 'detail') {
        targetUrl = `https://${TARGET_HOST}/${locale}/scripts/${scriptId}`;
      } else {
        targetUrl = `https://${TARGET_HOST}/${locale}/scripts/${scriptId}/feedback`;
      }
    } else if (usersMatch) {
      const locale = usersMatch[1];
      const userId = usersMatch[2];
      
      dataType = 'users';
      targetUrl = `https://greasyfork.org/${locale}/users/${userId}.json`;
    } else {
      const locale = ugcMatch[1];
      const category = ugcMatch[2];
      const discussionId = ugcMatch[3];
      
      dataType = 'ugc';
      targetUrl = `https://${TARGET_HOST}/${locale}/discussions/${category}/${discussionId}`;
    }
    
    const pageParam = url.searchParams.get('page');
    if (pageParam) {
      const separator = targetUrl.includes('?') ? '&' : '?';
      targetUrl += `${separator}page=${pageParam}`;
    }
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Node': 'DEFAULT'
      },
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    let result;
    if (dataType === 'users') {
      const jsonData = await response.json();
      const sensitiveWords = getSensitiveWords();
      result = replaceSensitiveWordsInObject(jsonData, sensitiveWords);
    } else {
      const html = await response.text();
      
      if (dataType === 'detail') {
        result = extractDetailData(html);
      } else if (dataType === 'feedback') {
        result = extractFeedbackData(html);
      } else {
        result = extractUgcData(html);
      }
    }
    
    return new Response(JSON.stringify(result, null, 2), {
      headers: corsHeaders
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// Cloudflare Pages Functions 导出
export async function onRequestGet(context) {
  return handleRequest(context.request);
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': CACHE_MAX_AGE.toString()
    }
  });
}