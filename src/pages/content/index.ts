const currentUrl = window.location.href;

// 检查当前URL是否匹配到 http://localhost:3000/*
if (currentUrl.startsWith('https://www.bilibili.com')) {
  // 在这里添加你想要执行的逻辑
  import('./components/panel');
  import('./components/mini-button'); 
  // ...
}
if (currentUrl.startsWith('https://kedaibiao.pro') 
|| currentUrl.startsWith('https://www.kedaibiao.pro') 
|| currentUrl.startsWith('http://localhost'))  {
    console.log('插件进入网页模式');
    import('./components/web-site');

     
}

