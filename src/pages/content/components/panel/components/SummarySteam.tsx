import { CaretRightOutlined, DownOutlined, LoadingOutlined } from '@ant-design/icons';
import { Button, Collapse, Tag } from 'antd';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { apply, tw } from 'twind';
import { css } from 'twind/css';

import { getP, getStartEmojiRegex } from '../helpers';
import { useSummaryStore } from '../stores/summary';
import { API_BASE_URL } from '@src/pages/common/constants';
import { useUserStore } from '@src/pages/common/stores/user';
import { useGlobalStore } from '../stores/global';
import { User } from '@src/pages/common/types';

const { Panel } = Collapse;
let isCancelled = false;

export default SummaryStream;


function secondToTimeStr(s: number): string {
  const m = Math.floor(s / 60);
  const s2 = parseInt(String(s % 60));
  const left = String(m).length === 1 ? `0${m}` : m;
  const right = String(s2).length === 1 ? `0${s2}` : s2;

  return `${left}:${right}`;
}

function SummaryStream(props): JSX.Element | null {
  const [actives, setActives] = useState([]);
  const summary = useSummaryStore();
  const [isTyping, setIsTyping] = useState(true)
  const [sections, setSections] = useState([])
  const [summaryText, setSummaryText] = useState('')
  const { letterList } = useGlobalStore()
  useEffect(() => {
    if (props.expandAll) {
      handleExpandAll()
    } else {
      setActives([])
    }
  }, [props.trigger])

  useEffect(() => {
   
    
    getResponse()


  }, [])
  const rootStyle = tw(css`
    ${apply`box-border pl-[10px] pr-[10px] pb-[10px]`}
    .ant-collapse-item-active {
      background: rgba(0, 0, 0, 0.05);
    }
    .ant-collapse-expand-icon {
      padding-inline-end: 8px !important;
    }
    .ant-collapse-header {
      padding: 12px !important;
    }

    .ant-collapse-header[aria-expanded='true'] {
      padding-bottom: 5px !important;
    }

    .ant-collapse-content-box {
      padding-left: 35px !important;
      padding-bottom: 12px !important;
    }
  `);



  function easeSetSections(_sections) {
    let i = 0;
    let inter = setInterval(() => {
      setSections(value => [...value, _sections[i++]])
      if (i >= _sections.length) {
        clearInterval(inter)
        summary.setLoading(false)

      }
    }, 500)

  }
  async function getResponse() {
    const data = { body: letterList };
    useGlobalStore.getState().setShowText("课代表正在写笔记");
    let userInfo = {}
    try {
      const resp = await fetch(`${API_BASE_URL}/v2/ai-notes/${summary.currentBvid}${getP()}`, {
        method: 'post',
        body: JSON.stringify(data),

        headers: {
          'Authorization': `Bearer ${useUserStore.getState().token}`,
          'Content-Type': 'application/json'
        },

      })
      const reader = resp.body.getReader();
      const textDecoder = new TextDecoder()
      while (1) {
        if (isCancelled) {
          break; // 跳出循环，停止读取
      }
        const { done, value } = await reader.read()
        if (done) {
          useGlobalStore.getState().setShowText("");
          summary.setSummaryData({
            ...userInfo,
            results: sections,
            summary: summaryText
          })
          break;
        }

        const str = textDecoder.decode(value)
        const _list = str.split('\n\n')
        _list.forEach(value => {
          const _lineList = value.split('\n')


          if (_lineList.length > 1) {
            if (_lineList[0].includes('personal')) {
              const _objList = _lineList[1].split('data: ')
              if (_objList.length > 1) {

                let obj = JSON.parse(_objList[1])
                userInfo = obj.body
                
   
                const credit = {
                  remainingCredit: obj.body.remainingCredit,
                  totalCredit: obj.body.totalCredit,
                  creditResetTime: obj.body.creditResetTime,
                }
                useUserStore.getState().setCredit(credit);
                summary.setCurrentNotebookId(obj.body.notebookId)
                summary.setLatestModel(obj.body?.latestModel)
                if (obj.body.remainingCredit < 0) {
                  isCancelled = true
                  summary.setLoading(false)
                  useGlobalStore.getState().setShowText("");

                  useGlobalStore.getState().setActivedBody('no_money')
                }
              }
            }
            else if (_lineList[0].includes('finish')) {
              const _objList = _lineList[1].split('data: ')
              if (_objList.length > 1) {

                setIsTyping(false)

              }
            }
            else if (_lineList[0].includes('summary')) {

              const _objList = _lineList[1].split('data: ')
              if (_objList.length > 1) {

                let obj = JSON.parse(_objList[1])
                setSummaryText(value => value + obj.body)
              }
            } else if (_lineList[0].includes('sections')) {
              const _objList = _lineList[1].split('data: ')
              if (_objList.length > 1) {
                let obj = JSON.parse(_objList[1])

                try {
                  setSections(obj.body.map(item => {
                    const emojiReg = getStartEmojiRegex();
                    if (item?.brief)
                      return {
                        brief: item.brief.replace(emojiReg, ''),
                        startEmojiChar: item.brief.match(emojiReg)?.[0],
                        detail: item.detail,
                        end: convertTimeToSecond(item.end),
                        start: convertTimeToSecond(item.start)
                      };

                    function convertTimeToSecond(time: string): number | string {
                      // 1.01
                      if (/^\d+\.\d+$/.test(time)) {
                        return Number(time);
                      }

                      // 1:08.01
                      if (/^\d+:((\d+\.\d+)|(\d+))$/.test(time)) {
                        const [m, s] = time.split(':');

                        return Number(m) * 60 + Number(s);
                      }

                      // 00:27:02
                      if (/^\d+:\d+:\d+$/.test(time)) {
                        const [h, m, s] = time.split(':');

                        return Number(h) * 3600 + Number(m) * 60 + Number(s);
                      }

                      // 00:02:36.000
                      if (/^\d+:\d+:\d+\.\d+$/.test(time)) {
                        const [h, m, s] = time.split(':');

                        return Number(h) * 3600 + Number(m) * 60 + Number(s);
                      }

                      return time;
                    }
                  }))
                  summary.setLoading(false)

                } catch (error) {
                  summary.setLoading(false)
                  console.log(error);

                }


              }
            }
          }
        })
      }
    } catch (error) {
      console.error('请求错误:', error);
      summary.setLoading(false)

    }

  }
  const handleExpandAll = () => {
    const _temps: String[] = [];
    sections.map((item, index) => {
      _temps.push(index);
    });
    setActives(_temps);
  };
  const handleCloseAll = () => {
    setActives([]);
  };
  const handleExpand = _index => {
    if (actives.includes(_index)) {
      actives.splice(actives.indexOf(_index));
      setActives(actives);
    } else {
      setActives([...actives, _index]);
    }
  };

  return (
    <div className={rootStyle}>
      <p className={tw`text-[15px] font-semibold ` + ` mh-3 ${isTyping ? 'cursor-after' : ''}`}>{summaryText}</p>
      <Collapse
        bordered={false}
        expandIcon={props => {
          const panelId = (props as any).id;

          return (
            sections[panelId]?.startEmojiChar ?? (
              <CaretRightOutlined rotate={props.isActive ? 90 : 0} />
            )
          );
        }}
        activeKey={actives}
        className={clsx(tw`bg-transparent`, 'summary-collapse')}
      >
        {/* <div className={tw`flex justify-around mt-2 `}>
          <Button onClick={handleExpandAll} className={tw` text-gray-500`}>
            展开全部
            <ExpendAll />
          </Button>
          <Button onClick={handleCloseAll} className={tw` text-gray-500`}>
            收起全部
            <ExpendAllRevers />
          </Button>
        </div> */}
        {
          summary.requesting && !isTyping ? <div className='bg-transparent w-full h-2 justify-center flex items-center content-center'>
            <LoadingOutlined></LoadingOutlined>
          </div> : ''
        }

        {sections.map((section, index) => (
          <Panel
            header={
              <span className={tw`text-[15px] font-medium`}>
                {section?.brief}
                <br />

                <div
                  className={clsx(
                    tw(
                      `hidden text([13px] [#c5c5c5]) absolute bottom-[-8px] left-[50%]`,
                      css`
                        transform: translate(-50%, -50%);
                        transition: all 0.1s 1s !important;
                      `
                    ),
                    'click-to-expand'
                  )}
                >
                  点击展开 <DownOutlined className={tw`text-[10px]`} />
                </div>
              </span>
            }
            id={`${index}`}
            onClick={() => handleExpand(index)}
            key={index}
            className={tw(
              `
          mt-[10px] rounded-[6px]! border-0!  relative
          bg([rgba(0,0,0,.02)] hover:([rgba(0,0,0,0.05)]))`,
              css`
                &:hover .ant-collapse-header[aria-expanded='false'] .click-to-expand {
                  display: block;
                }
                &:hover .ant-collapse-header[aria-expanded='false'] {
                  padding-bottom: 19px !important;
                }import { useGlobalStore } from './../stores/global';

              `
            )}
            extra={
              <Tag
                color="blue"
                className={tw`mr-0! w-[90px] flex justify-between`}
                onClick={event => {
                  if (typeof section?.start === 'number') {
                    window.postMessage({
                      type: 'change-video-playback-time',
                      data: section?.start
                    });
                  }

                  event.stopPropagation();
                }}
              >
                {typeof section.start === 'number'
                  ? secondToTimeStr(section?.start)
                  : section.start}
                <span>-</span>
                {typeof section.end === 'number'
                  ? secondToTimeStr(section?.end)
                  : section.end}
              </Tag>
            }
          >
            <p className={tw`text([14.5px] [#333333a3]) relative pl-[8px]`}>
              {section?.detail}
              <div className={tw`absolute h-full w-[1px] bg-[#0000001a] left-0 top-0`} />
            </p>
          </Panel>
        ))}
      </Collapse>
    </div>
  );
}
