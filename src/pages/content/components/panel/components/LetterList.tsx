import React, { useEffect, useState } from 'react'
import { useSummaryStore } from '../stores/summary';
import { axiosInstance } from '@src/pages/common/libs/axios';
import { apply, tw } from 'twind';
import { Skeleton, Tabs, Tag, Input, Checkbox, Button } from 'antd';
import { useGlobalStore } from '../stores/global';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
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
  const [keyList, setKeyList] = useState([])
  const [nowSelectKey, setNowSelectKey] = useState('')
  const [realTime, setRealTime] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1);
  useEffect(() => {
    if (global.letterList.length === 0)
      getLetterData()
    else {
      setOriginList([...global.letterList])
      setLoading(false)
      console.log(global.letterList);
      
      setLetterList([...global.letterList])

    }
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
      global.setLetterList(value)
      setOriginList([...value])
      console.log('字幕加载完毕');
    })
  }

  const handleInputChange = (event: { target: { value: any; }; }) => {
    const value = event.target.value;
    setSearchTerm(value);
    // 调用防抖函数
    // setLetterList(searchArray([...originList], value))
    const searchList = searchTerm.split(' ')
    if (value === '' || !value) {
    setKeyList([])

      return
    }
    setKeyList([])
    let tempList = []
    letterList.map((item, i) => {
      // const mapValue = content.replace(new RegExp(searchTerm, "gi"), '%');
      const mapValue = item.content.replace(new RegExp(value, "gi"), '%');
      const contentList = mapValue.split('%')

      contentList.map((_, j) => {
        if (j !== contentList.length - 1)
          tempList.push(i + '-' + j)
      })
    })
    setKeyList(tempList)
    setNowSelectKey(tempList[0])
  };

  // const searchArray = (array, searchTerm) => {
  //   return array.filter((item) => {
  //     const regex = new RegExp(searchTerm, "gi");
  //     return item.content.match(regex);
  //   }).map((item) => {
  //     const regex = new RegExp(searchTerm, "gi");
  //     return { ...item, content: item.content.replace(regex, `<em style="color: #ffa502;">${searchTerm}</em>`) };

  //   })

  // };
  const onCheckBoxChange = (e) => {

    setRealTime(e.target.checked)
  }
  const renderArticle = () => {
    return (
      <div className={tw`h-96 overflow-y-scroll`} ref={scrollRef}>
        {
          letterList.map((item, index) => (
            <span className={tw`${index === currentIndex ? 'text-red-500 highlight' : ''}`}>
              <span>{renderLineRegs(item.content, index)}</span>
              <span>，</span>
            </span>
          ))
          }
      </div>
    )
  }
  const scrollRef = React.useRef(null);
  useEffect(() => {
    // 滚动到当前歌词行
    if (scrollRef.current && realTime) {
      const scrollContainer = scrollRef.current;
      const currentLine = scrollContainer.querySelector('.highlight');


      if (!currentLine) return
      if (global.mode !== 'list') {

      }
      const offset = currentLine.offsetTop - 460;
      console.log(offset);
      
      if (currentIndex > 10) {
        scrollContainer.scrollTo({
          top: offset,
          behavior: 'smooth',
        });
      }

    }
  }, [currentIndex, realTime]);
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current;
      const currentLine = scrollContainer.querySelector('.selectKey');
      if (!currentLine) return

      const offset = currentLine.offsetTop - 460;
        scrollContainer.scrollTo({
          top: offset,
          behavior: 'smooth',
        });
    }

  }, [nowSelectKey])
  const handleKeyUp = () => {
    let index = keyList.findIndex((value) => value === nowSelectKey)
    
    if (index === -1) {
      return
    }
    if (index === 0) {
      index = keyList.length - 1
    }else {
      index -= 1
      }
    
    setNowSelectKey(keyList[index])
  }
  const handleKeyDown = () => {
    let index = keyList.findIndex((value) => value === nowSelectKey)
    
    if (index === -1) {
      return
    }
    index = (index + 1) % keyList.length 

    setNowSelectKey(keyList[index])

  }
  const renderLineRegs = (content, _index) => {
    if (!searchTerm) {
      return content; // 当 searchTerm 为空时，直接返回 false
    }
    const searchList = searchTerm.split(' ')

    const mapValue = content.replace(new RegExp(searchTerm, "gi"), '%');
    const contentList = mapValue.split('%')
    if (contentList.length > 1) {

      return (
        contentList.map((item, index) => {
          return <>
            <span className={tw`bg-gray-500 text-white`}>{item}</span>
            {
              index != contentList.length - 1 ? <span
                className={`${nowSelectKey === (_index + '-' + index) ?'selectKey ':0}` +
                tw`${nowSelectKey === (_index + '-' + index) ? ' underline text-red-300 ' : 'bg-[#ffee6f] bg-yellow-400 text-white '}`}>{searchList[0]}</span> : ''
            }

          </>
        })
      )
    }
    else {
      return <span>{content}</span>
    }

  };
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
                <div key={index + item.from} className={tw`flex pl-3 pr-3 cursor-pointer  hover:bg-gray-200 
              ${index === currentIndex ? 'text-red-500 highlight' : ''}`
                }
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


                  <div >
                    {
                      renderLineRegs(item.content, index)

                    }

                  </div>


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
        <div className={tw`h-96 pl-3 pr-3`}>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </>
    )
  return (
    <div className={tw`pl-3 pr-3`}>
      <div className={tw`flex justify-between items-center`}>
        <Input placeholder="搜索字幕" onChange={handleInputChange} />
        <div className={tw`flex justify-center items-center ml-2`}>
          <span className={tw`relative`}>
            {
              keyList.length>0?<span className={tw`absolute -top-2 -left-10 `}>{keyList.findIndex(value=>value===nowSelectKey)+1}/{keyList.length}</span>:<span className={tw`absolute -top-2 -left-8 `}>-/-</span>
            }

          </span>
          <span className={tw`ml-2`}>
            <Button onClick={handleKeyUp} icon={<ArrowUpOutlined rev={undefined} />} >

            </Button>
          </span>
          <span className={tw`ml-2`}>
            <Button onClick={handleKeyDown} icon={<ArrowDownOutlined rev={undefined} />} >

            </Button>
          </span>



        </div>

      </div>

      <div className={tw`flex items-center justify-between `}>
        {
          letterList.length > 0 ?
            <div className={tw`mt-2`}><p>共{letterList.length + 1}条字幕{keyList.length>0?<>，搜索到{keyList.length}条</>:''}</p></div> : ''
        }
        <Checkbox onChange={onCheckBoxChange}>实时滚动</Checkbox>
      </div>
      {
        global.mode !== 'list' ? renderArticle() : renderList()
      }

    </div>
  )
}
