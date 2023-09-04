import type { SummaryData } from "./stores/summary";

// export function getBvid() {
//   const url = window.location.href;
//   const bvid = 'bilibili-' + url.split('/')[4].split('?')[0];

//   return bvid;
// }
export function getBvid(): string {
  const url = window.location.href;

  const bvidRegex = /bvid=([^&]+)/;
  const match = bvidRegex.exec(url);

  if (match && match[1]) {
    return "bilibili-" + match[1];
  }

  const videoRegex = /video\/([^/?&]+)/;
  const videoMatch = videoRegex.exec(url);

  if (videoMatch && videoMatch[1]) {
    return "bilibili-" + videoMatch[1];
  }

  return "";
}

export function getP() {
  const queryString = window.location.search;

  const urlParams = new URLSearchParams(queryString);
  let _p = urlParams.get("p");
  if (!_p) {
    _p = "";
  } else {
    _p = "%3Fp=" + _p;
  }

  return _p;
}
export function devLog(message: any) {
  if (process.env.NODE_ENV === "development") {
  }
}
export function getStartEmojiRegex() {
  return /^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])+/;
}

export function createSummaryMarkdown(data: SummaryData["results"]) {
  const videoTitle = (document.querySelector(".video-title") as HTMLElement)
    .innerText;
  const markdown = [
    `“太长不看”版: ${videoTitle}
${data.summary}
`,
    ...data.sections.map((section) => {
      const emojiReg = getStartEmojiRegex();
      const partTitle = section.brief.replace(emojiReg, "");
      const partTitleEmojiChar = section.brief.match(emojiReg)?.[0] ?? "";

      return `${formatTime(
        section.start
      )} ${partTitleEmojiChar} ${partTitle}： ${section.detail}`;
    }),
  ].join("\n");

  return (
    markdown +
    "\n\n#太长不看 #AI课代表 #视频摘要目录 taichangbukan.cn 总结的不好请原谅~"
  );
}
export function createSummaryShare(data: SummaryData, id) {
  const videoTitle = (document.querySelector(".video-title") as HTMLElement)
    .innerText;

  return `快来看这个视频《${videoTitle}》，太长不看版：“${data.data.summary}”
传送：https://taichangbukan.cn/welcome?share=${data.currentBvid.split("-")[1]}`;
}
function formatTime(seconds) {
  const totleseconds = Math.round(seconds);
  const minutes = Math.floor(totleseconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (totleseconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}
export const fleshTimeFormatter = (timestamp) => {
  // 获取当前时间戳（以秒为单位）
  timestamp = timestamp * 1000;
  const now = Date.now();
  const diff = timestamp - now;
  const day = 24 * 60 * 60 * 1000;
  const hour = 60 * 60 * 1000;
  if (diff < 60) {
    const seconds = Math.floor(diff / (60 * 1000 * 60));
    return `${seconds}秒`;
  } else if (diff < hour) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}分钟`;
  } else if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours}小时`;
  }
};
export const vipExpireInFormatter = (seconds) => {
  // 计算天数，并得到剩余的秒数
  const days = Math.floor(seconds / 86400);
  const remainingSecondsAfterDays = seconds % 86400;

  const hours = Math.floor(remainingSecondsAfterDays / 3600);
  const remainingSecondsAfterHours = remainingSecondsAfterDays % 3600;

  const minutes = Math.floor(remainingSecondsAfterHours / 60);
  const remainingSeconds = remainingSecondsAfterHours % 60;

  let result = "";

  if (days > 0) {
    result += `${days} 天 ${hours} 小时`;
  } else if (hours > 0) {
    result += `${hours} 小时 ${minutes} 分钟`;
  } else {
    result += `${minutes} 分钟 ${remainingSeconds} 秒`;
  }

  return result;
};
