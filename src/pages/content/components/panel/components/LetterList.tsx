import React, { useEffect, useState } from 'react'
import { useSummaryStore } from '../stores/summary';
import { axiosInstance } from '@src/pages/common/libs/axios';
import { apply, tw } from 'twind';
import { Skeleton, Tabs, Tag, Input, Checkbox, Button, Tooltip } from 'antd';
import { useGlobalStore } from '../stores/global';
import { ArrowUpOutlined, ArrowDownOutlined, CloseOutlined } from '@ant-design/icons';
import { MatchCaseIcon } from './Header/icons';
import { read } from 'fs';
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
  const [keyList, setKeyList] = useState([])
  const [nowSelectKey, setNowSelectKey] = useState('')
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(-1)
  const [startY, setStartY] = useState(-1)
  const [autoMode, setAutoMode] = useState(true)
  const [scrollTopValue, setScrollValue] = useState(-1)
  const [lastScrollTop, setLastScrollTop] = useState(0);
  let flag = false

  useEffect(() => {
    setAutoMode(false)

    if (global.letterList.length === 0)
      getLetterData()
    else {
      setOriginList([...global.letterList])
      setLetterList([...global.letterList])

      setSearchTerm(global.searchWords)
      setLoading(false)
      findSelectKeyList(global.searchWords, global.letterList)
      refleshTime(global.currentTime)
      setNowSelectKey(global.currentSelectKey)
    }

  }, [])

  useEffect(() => {
    if (originList.length > 0) {
      refleshTime(global.currentTime)

    }
  }, [global.currentTime, originList])
  const refleshTime = (_currentTime: number) => {
    let maxIndex = -1
    originList.map((item, index) => {
      if (Math.floor(item.from) <= _currentTime) {
        maxIndex = index
      }

    });


    setCurrentIndex(maxIndex);

  }
  const getLetterData = () => {
    const queryString = window.location.search;

    const urlParams = new URLSearchParams(queryString);


    let _p = urlParams.get('p');
    if (!_p) {
      _p = '';
    } else {
      _p = '%3Fp=' + _p;
    }
    axiosInstance.get(`/v2/ai-notes/${summary.currentBvid + _p}/subtitle`).then(value => {
      setLetterList(value)
      setLoading(false)
      global.setLetterList(value)
      setOriginList([...value])
    })
  }
  const findSelectKeyList = (value, letterList) => {
    setKeyList([])
    let tempList = []
    let escapedValue = value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    let pattern: any;
    if (global.caseMode) {
      pattern = new RegExp(`(${escapedValue})`, "g");

    } else {
      pattern = new RegExp(`(${escapedValue})`, "gi");

    }
    letterList.map((item, i) => {

      const contentList = item.content.split(pattern)

      contentList.map((_, j) => {
        if (pattern.test(_))
          tempList.push(i + '-' + j)

      })
    })

    setKeyList(tempList)

    setNowSelectKey(tempList[0])
    global.setcurrentSelectKey(tempList[0])
  }
  const handleInputChange = (event: { target: { value: any; }; }) => {
    const value = event.target.value;
    setSearchTerm(value);
    global.setSearchWords(value)
    // 调用防抖函数
    // setLetterList(searchArray([...originList], value))
    if (value === '' || !value) {
      setKeyList([])

      return
    }

    global.setRealMode(false)
    findSelectKeyList(value, letterList)
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

    global.setRealMode(e.target.checked)
  }

  const scrollRef = React.useRef(null);
  useEffect(() => {
    // 滚动到当前歌词行
    if (scrollRef.current && global.realMode) {
      const scrollContainer = scrollRef.current;
      const currentLine = scrollContainer.querySelector('.highlight');


      if (!currentLine) return
      if (global.mode !== 'list') {

      }
      const offset = currentLine.offsetTop - 460;

      if (currentIndex > 10) {
        scrollContainer.scrollTo({
          top: offset,
          behavior: 'smooth',
        });
        setTimeout(()=>{
          setAutoMode(true)

        }, 1000)

      }

    }
  }, [currentIndex, global.realMode]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current;
      const currentLine = scrollContainer.querySelector('.selectKey');
      if (!autoMode) return

      const offset = currentLine.offsetTop - 460;
      scrollContainer.scrollTo({
        top: offset,
        behavior: 'smooth',
      });
      setAutoMode(true)
    }

  }, [nowSelectKey])


  const handleScroll = (event) => {

    const scrollTop = event.target.scrollTop;
    const scrollDifference = scrollTop - lastScrollTop;

    if (scrollDifference> 8) {
      console.log('diff>8');
      if (autoMode) {
        global.setRealMode(false)
      }
    }
    setLastScrollTop(scrollTop)
  }
  const handleKeyUp = () => {
    global.setRealMode(false)
    let index = keyList.findIndex((value) => value === nowSelectKey)

    if (index === -1) {
      return
    }
    if (index === 0) {
      index = keyList.length - 1
    } else {
      index -= 1
    }

    setNowSelectKey(keyList[index])
    global.setcurrentSelectKey(keyList[index])

  }
  const handleKeyDown = () => {
    global.setRealMode(false)

    let index = keyList.findIndex((value) => value === nowSelectKey)

    if (index === -1) {
      return
    }
    index = (index + 1) % keyList.length

    setNowSelectKey(keyList[index])
    global.setcurrentSelectKey(keyList[index])
  }
  const handleDeleteKey = () => {
    setSearchTerm('')
    global.setSearchWords('')
  }

  const renderLineRegs = (content, _index) => {
    if (!searchTerm) {
      return content; // 当 searchTerm 为空时，直接返回 false
    }

    // const mapValue = content.replace(new RegExp(searchTerm, "gi"), '*%#');
    let escapedValue = searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    let pattern: any;
    if (global.caseMode) {
      pattern = new RegExp(`(${escapedValue})`, "g");

    } else {
      pattern = new RegExp(`(${escapedValue})`, "gi");

    }
    const contentList = content.split(pattern)

    if (contentList.length >= 0) {

      return (
        <>

          {
            contentList.map((item, index) => {
              return <>
                {
                  pattern.test(item) ?
                    <span className={`${nowSelectKey === (_index + '-' + index) ? 'selectKey ' : ' '}` +
                      tw`${nowSelectKey === (_index + '-' + index) ? ' bg-[#fb9434] ' : ' bg-[#fcfa04]'}`}>
                      {item}
                    </span>
                    :
                    <span>{item}</span>
                }


              </>

            })
          }
        </>
      )
    }
    else {
      return <span>{content}</span>
    }

  };
  const renderArticle = () => {
    let count = 0;
    return (
      <div className={tw` h-96 overflow-y-scroll`} ref={scrollRef}>
        {
          letterList.map((item, index) => {
            if (count >= 2) count = 0
            return (
              <span className={tw`${index === currentIndex ? ' text-red-500 highlight' : ''}`}>
                  <span className={tw`cursor-pointer hover:underline` + `dm-info-dm`}
                    onClick={(e) => handleClick(e, item)}
                    onMouseMove={handleMouseMove}
                    onMouseDown={(e) => handleMouseDown(e, item)}
                  >
                    {renderLineRegs(item.content, index)}

                  </span>

                <span>{++count >= 2 ? '。' : '，'}</span>
              </span>
            )
          })
        }


      </div>
    )
  }
  function handleMouseDown(event, index) {
    // 记录鼠标初始位置


    event.stopPropagation();
    setIsDragging(false)
    setStartX(event.clientX)
    setStartY(event.clientY)

  }

  const handleClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDragging) {
      setIsDragging(false)
      return;
    }
    if (typeof item.from === 'number') {
      window.postMessage({
        type: 'change-video-playback-time',
        data: Math.floor(item.from)
      });
      refleshTime(Math.floor(item.from))


    }

    e.stopPropagation();

  }
  function handleMouseMove(event) {

    // 判断是否超过最小拖动距离阈值
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      setIsDragging(true)
      setStartX(deltaX)
      setStartY(deltaY)
    }

  }
  const renderList = () => {
    return (
      <>
        <div className={tw`mt-2 `} >
          <div className={tw`flex pl-3 pr-3`}>
            <span className={tw`w-12`}>时间</span>
            <span>字幕</span>
          </div>
          <div className={tw`h-96 overflow-y-scroll `} onScroll={handleScroll} ref={scrollRef}>
            {
              letterList.map((item, index) => (
                <div key={index + item.from} className={tw`flex items-center pb-1 pt-1 pl-3 pr-3 cursor-pointer   hover:bg-gray-200 
              ${index === currentIndex ? 'text-red-400 highlight' : ''}`
                }
                  onClick={(e) => handleClick(e, item)}
                  onMouseMove={handleMouseMove}
                  onMouseDown={(e) => handleMouseDown(e, item)}
                >
                  <div className={tw`w-12 relative ` + `dm-info-time`}>
                    {currentIndex === index ? <span className={tw`-ml-3`}>•</span> : ''}

                    {secondToTimeStr(item.from)}
                  </div>


                  <div className={tw`dm-info-dm w-4/5`}>

                    {
                      global.caseMode ?
                        renderLineRegs(item.content, index)
                        :
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
        <div className={tw`h-96 pl-3 pr-3 mt-3`}>
          <Skeleton className={tw`mt-3`} active />
          <Skeleton className={tw`mt-3`} active />
          <Skeleton className={tw`mt-3`} active />
        </div>
      </>
    )
  return (
    <div className={tw`pl-3 pr-3`}>
      <div className={tw`flex justify-between items-center`}>
        <div className={tw`relative w-full`}>
          <Input className={tw`w-full`} placeholder="搜索字幕" onChange={handleInputChange} value={searchTerm} />
          <span className={tw`absolute top-0 right-2 flex h-full items-center`}>
            <span >
              {
                searchTerm !== '' ? <span >{keyList.findIndex(value => value === nowSelectKey) + 1}/{keyList.length}</span> : ''
              }

            </span>
            <Tooltip title="匹配大小写">
              <MatchCaseIcon onClick={() => global.setCaseMode(!global.caseMode)}
                className={tw`ml-1 cursor-pointer p-1 w-4 border-box h-4  
          rounded-sm ${global.caseMode ? 'bg-gray-200 ' : 'hover:bg-gray-100'}`} />

            </Tooltip>
          </span>
        </div>
        <div className={tw`flex justify-center items-center ml-2`}>
            
          <span className={tw`ml-2`}>
            <Button onClick={handleKeyUp} icon={<ArrowUpOutlined rev={undefined} />} >

            </Button>
          </span>
          <span className={tw`ml-2`}>
            <Button onClick={handleKeyDown} icon={<ArrowDownOutlined rev={undefined} />} >

            </Button>
          </span>
          <span className={tw`ml-2`}>
            <Button onClick={handleDeleteKey} icon={<CloseOutlined rev={undefined} />} >

            </Button>
          </span>


        </div>

      </div>

      <div className={tw`flex items-center justify-between `}>
        {
          letterList.length > 0 ?
            <div className={tw`mt-2 text-[14px]`}><p>共{letterList.length + 1}条字幕{searchTerm !== '' ? <>，搜索到{keyList.length}条</> : ''}</p></div> : ''
        }
        <Checkbox onChange={onCheckBoxChange} checked={global.realMode}>实时滚动</Checkbox>
      </div>
      {
        global.mode !== 'list' ? renderArticle() : renderList()
      }

    </div>
  )
}
