import React, { useEffect, useState} from 'react'
import { useSummaryStore } from '../stores/summary';
import { axiosInstance } from '@src/pages/common/libs/axios';
import { apply, tw } from 'twind';
import { Skeleton ,Tabs, Tag,Input} from 'antd';
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
  useEffect(()=>{
    getLetterData()
  }, [])
  
  const getLetterData = ()=>{
    axiosInstance.get(`/v2/ai-notes/${summary.currentBvid}/subtitle`).then(value=>{
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
    }).map((item)=>{
      const regex = new RegExp(searchTerm, "gi");
      return {...item, content: item.content.replace(regex, `<em style="color: #ffa502;">${searchTerm}</em>`)};
      
    })

  };
  const renderArticle = () => {
    return (
      <>
            {
            letterList.map((item)=>(
              <span dangerouslySetInnerHTML={{
                __html: item.content+','
              }}></span>
            ))}
      </>
    )
  }
  const renderList = ()=> {
    return (
      <>
      <div className={tw`mt-2 max-h-screen`} >
        <div className={tw`flex pl-3 pr-3`}>
          <span className={tw`w-12`}>时间</span>
          <span>字幕</span>
        </div>
      {
        letterList.map((item, index)=>(
          <div className={tw`flex pl-3 pr-3 cursor-pointer hover:bg-gray-200`}
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
            
            <div dangerouslySetInnerHTML={{__html:item.content}}></div>

          
          </div>
        ))
      }
      </div>
      </>
    )
  }
  if (loading) 
  return (
    <>
    <div className={tw` pl-3 pr-3`}>
    <Skeleton/>
    <Skeleton/>
    <Skeleton/>
    <Skeleton/>
    <Skeleton/>
    </div>
    </>
  )
  return (
    <div className={tw`mh-100 pl-3 pr-3`}>
      <Input placeholder="搜索字幕" onChange={handleInputChange}/>
      {
        letterList.length>0&&global.mode==='list'?
      <div className={tw`mt-2`}><p>为你找到了{letterList.length+1}条字幕</p></div>:''
      }
      {
        global.mode!=='list'?renderArticle():renderList()
      }

    </div>
  )
}
