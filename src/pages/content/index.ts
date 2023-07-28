const currentUrl = window.location.href;

//检查是否是bilibili
if (currentUrl.startsWith('https://www.bilibili.com')) {
  import('./components/panel');
  import('./components/mini-button'); 
  // ...
}
//检查是否为网页
if (currentUrl.startsWith('https://kedaibiao.pro') 
|| currentUrl.startsWith('https://www.kedaibiao.pro') 
|| currentUrl.startsWith('http://localhost'))  {
    import('./components/web-site');

     
}

