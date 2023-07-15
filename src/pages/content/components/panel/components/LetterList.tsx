import React, { useEffect, useState } from 'react'
import { useSummaryStore } from '../stores/summary';
import { axiosInstance } from '@src/pages/common/libs/axios';
import { apply, tw } from 'twind';
import { Skeleton, Tabs, Tag, Input, Checkbox } from 'antd';
import { useGlobalStore } from '../stores/global';
function secondToTimeStr(s: number): string {
  const m = Math.floor(s / 60);
  const s2 = parseInt(String(s % 60));
  const left = String(m).length === 1 ? `0${m}` : m;
  const right = String(s2).length === 1 ? `0${s2}` : s2;
  return `${left}:${right}`;
}
export default function LetterList() {
  const summary = useSummaryStore();
  const global = useGlobalStore();
  const [letterList, setLetterList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("");
  const [originList, setOriginList] = useState([])
  const [mode, setMode] = useState('list')
  const [realTime, setRealTime] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1);
  useEffect(() => {
    getLetterData()
    const listener = (event: MessageEvent) => {
      const data = event.data
      if (data.type === 'setCurrentTime') {
        global.setCurrentTime(data.data.currentTime)
      }
    }
    window.addEventListener('message', listener)
    return () => {
      window.removeEventListener('message', listener)

    }
  }, [])
  useEffect(() => {
    if (originList.length > 0) {
      refleshTime(global.currentTime)

    }
  }, [global.currentTime])
  const refleshTime = (_currentTime: number) => {
    let maxIndex = -1
    originList.map((item, index) => {
      if (item.from <= _currentTime) {
        maxIndex = index
      }

    });
    setCurrentIndex(maxIndex);

  }
  const getLetterData = () => {
    axiosInstance.get(`/v2/ai-notes/${summary.currentBvid}/subtitle`).then(value => {
      setLetterList(value)
      setLoading(false)
      setOriginList([...value])
      console.log('字幕加载完毕');
    })
  }

  const handleInputChange = (event: { target: { value: any; }; }) => {
    const value = event.target.value;
    setSearchTerm(value);
    // 调用防抖函数
    setLetterList(searchArray([...originList], value))

  };

  const searchArray = (array, searchTerm) => {
    return array.filter((item) => {
      const regex = new RegExp(searchTerm, "gi");
      return item.content.match(regex);
    }).map((item) => {
      const regex = new RegExp(searchTerm, "gi");
      return { ...item, content: item.content.replace(regex, `<em style="color: #ffa502;">${searchTerm}</em>`) };

    })

  };
  const onCheckBoxChange = (e) => {
    
    setRealTime(e.target.checked)
  }
  const renderArticle = () => {
    return (
      <div className={tw`h-96 overflow-y-scroll` } ref={scrollRef}>
        {
          letterList.map((item, index) => (
            <span className={tw`${index === currentIndex ?'text-red-500 highlight' : ''}` }>
              <span>{item.content}</span>
              <span>，</span>
            </span>
          ))}
      </div>
    )
  }
  const scrollRef = React.useRef(null);
  useEffect(() => {
    // 滚动到当前歌词行
    if (scrollRef.current && realTime) {
      const scrollContainer = scrollRef.current;
      const currentLine = scrollContainer.querySelector('.highlight');

    
      if (!currentLine  ) return
      if (global.mode !== 'list') {

      }
      const offset = currentLine.offsetTop - 460;
      console.log('offset:' + offset);
      if (currentIndex > 10) {
        scrollContainer.scrollTo({
          top: offset ,
          behavior: 'smooth',
        });
      }

    }
  }, [currentIndex, realTime]);
  const renderList = () => {
    return (
      <>
        <div className={tw`mt-2 `} >
          <div className={tw`flex pl-3 pr-3`}>
            <span className={tw`w-12`}>时间</span>
            <span>字幕</span>
          </div>
          <div className={tw`h-96 overflow-y-scroll `} ref={scrollRef}>
          {
            letterList.map((item, index) => (
              <div className={tw`flex pl-3 pr-3 cursor-pointer  hover:bg-gray-200 
              ${index === currentIndex ?'text-red-500 highlight' : ''}` }
                onClick={event => {
                  if (typeof item.from === 'number') {
                    window.postMessage({
                      type: 'change-video-playback-time',
                      data: item.from
                    });
                  }

                  event.stopPropagation();
                }}
              >
                <div className={tw`w-12`}>
                  {secondToTimeStr(item.from)}
                </div>

                <div dangerouslySetInnerHTML={{ __html: item.content }}></div>


              </div>
            ))
          }
          </div>
        </div>
      </>
    )
  }
  if (loading)
    return (
      <>
        <div className={tw` pl-3 pr-3`}>
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </>
    )
  return (
    <div className={tw`mh-100 pl-3 pr-3`}>
      <Input placeholder="搜索字幕" onChange={handleInputChange} />
      <div className={tw`flex items-center justify-between `}>
      {
        letterList.length > 0 && global.mode === 'list' ?
          <div className={tw`mt-2`}><p>为你找到了{letterList.length + 1}条字幕</p></div> : ''
      }
        <Checkbox onChange={onCheckBoxChange}>实时滚动</Checkbox>
      </div>
      {
        global.mode !== 'list' ? renderArticle() : renderList()
      }

    </div>
  )
}
