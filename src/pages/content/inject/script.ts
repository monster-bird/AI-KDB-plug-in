
window.addEventListener('message', function (event) {
  if (event.data.type === 'change-video-playback-time') {
    const isVideoEnded = window.player.getDuration() === window.player.getCurrentTime();

    if (isVideoEnded) {
      window.player.play();
    }

    window.player.seek(parseInt(event.data.data));
  }
});
let aid = 0
let title = ''
let pages = []
let pagesMap = {}
const refreshVideoInfo = async () => {

  // fix: https://github.com/IndieKKY/bilibili-subtitle/issues/5
  // 处理稍后再看的url( https://www.bilibili.com/list/watchlater?bvid=xxx&oid=xxx )
  const pathSearchs = {}
  location.search.slice(1).replace(/([^=&]*)=([^=&]*)/g, (matchs, a, b, c) => pathSearchs[a] = b)

  // bvid
  let aidOrBvid = pathSearchs.bvid // 默认为稍后再看
  if (!aidOrBvid) {
    let path = location.pathname
    if (path.endsWith('/')) {
      path = path.slice(0, -1)
    }
    const paths = path.split('/')
    aidOrBvid = paths[paths.length - 1]
  }

  if (aidOrBvid !== lastAidOrBvid) {
    // console.debug('refreshVideoInfo')

    lastAidOrBvid = aidOrBvid
    if (aidOrBvid) {
      //aid,pages
      let cid
      let subtitles
      if (aidOrBvid.toLowerCase().startsWith('av')) {//avxxx
        aid = aidOrBvid.slice(2)
        pages = await fetch(`https://api.bilibili.com/x/player/pagelist?aid=${aid}`, {credentials: 'include'}).then(res => res.json()).then(res => res.data)
        cid = pages[0].cid
        title = pages[0].part
        await fetch(`https://api.bilibili.com/x/player/v2?aid=${aid}&cid=${cid}`, {credentials: 'include'}).then(res => res.json()).then(res => {
          subtitles = res.data.subtitle.subtitles
        })
      } else {//bvxxx
        await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${aidOrBvid}`, {credentials: 'include'}).then(res => res.json()).then(async res => {
          title = res.data.title
          aid = res.data.aid
          cid = res.data.cid
          pages = res.data.pages
        })
        await fetch(`https://api.bilibili.com/x/player/v2?aid=${aid}&cid=${cid}`, {credentials: 'include'}).then(res => res.json()).then(res => {
          subtitles = res.data.subtitle.subtitles
        })
      }

      //pagesMap
      pagesMap = {}
      pages.forEach(page => {
        pagesMap[page.page + ''] = page
      })

      if (subtitles.length === 0) {
        console.log('字幕获取失败');
        
        return
      }
      await fetch(subtitles[0].subtitle_url).then(res => res.json()).then(res => {
        console.log(res);
        setTimeout(()=>{
          window.postMessage({type: 'getLetterList', data: res.body}, '*')

        }, 3000)

        // fetch(`https://api.kedaibiao.pro/v2/ai-notes/bilibili-${aidOrBvid}/subtitle`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${token}`
        //   },
        //   body: JSON.stringify(res) // 根据需要将数据转换为JSON格式
        // })
        // .then(response => {
        //   if (response.ok) {
        //     return response.json(); // 根据需要解析响应的数据
        //   }
        //   throw new Error('Network response was not ok.');
        // })
        // .then(result => {
        //   console.log(result); // 处理响应数据
        //   if (result.code === 200) {

        //   }
        // })
        // .catch(error => {
        //   console.log('Error:', error);
        // });
      })
      //send setVideoInfo
    }
  }
}
let lastAidOrBvid = null
let lastAid = null
let lastCid = null
window.addEventListener("message", (event) => {
  const {data} = event

  if (data.type === 'refreshVideoInfo') {
    
    refreshVideoInfo().catch(console.error)

  }
})
// const refreshSubtitles = () => {


//   const urlSearchParams = new URLSearchParams(window.location.search)
//   const p = urlSearchParams.get('p') || 1
//   const page = pagesMap[p]
//   console.log(p);
  
//   if (!page) return
//   const cid = page.cid

  
//   if (aid !== lastAid || cid !== lastCid) {
//     console.debug('refreshSubtitles', aid, cid)

//     lastAid = aid
//     lastCid = cid
//     if (aid && cid) {
//       fetch(`https://api.bilibili.com/x/player/v2?aid=${aid}&cid=${cid}`, {
//         credentials: 'include',
//       })
//         .then(res => res.json())
//         .then(res => {
//           // console.log('refreshSubtitles: ', aid, cid, res)
//           // iframe.contentWindow.postMessage({
//           //   type: 'setInfos',
//           //   infos: res.data.subtitle.subtitles
//           // }, '*')
//           console.log(res.data.subtitle.subtitles);
          
//         })
//     }
//   }
// }
setInterval(()=>{

  
 

    window.postMessage({
      data: {
        currentTime: window.player.getCurrentTime()
      }, type: 'setCurrentTime'
    }, '*')
    
}, 500)