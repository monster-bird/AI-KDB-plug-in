import { CaretRightOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Collapse, Tag } from 'antd';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { apply, tw } from 'twind';
import { css } from 'twind/css';

import { getStartEmojiRegex } from '../helpers';
import { useSummaryStore } from '../stores/summary';
import { useUserStore } from '@src/pages/common/stores/user';
import { BASE_URL } from '@src/pages/common/constants';

const { Panel } = Collapse;

export default Summary;

function secondToTimeStr(s: number): string {
  const m = Math.floor(s / 60);
  const s2 = parseInt(String(s % 60));
  const left = String(m).length === 1 ? `0${m}` : m;
  const right = String(s2).length === 1 ? `0${s2}` : s2;

  return `${left}:${right}`;
}

function Summary(props): JSX.Element | null {
  const { data, requesting, start } = useSummaryStore();
  const [actives, setActives] = useState([]);
  const { info } = useUserStore()
  useEffect(() => {
    if (props.expandAll) {
      handleExpandAll()
    } else {
      setActives([])
    }
  }, [props.trigger])

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

  if (!data || requesting) {
    start()
    return null;
  }

  const filteredSections = data.sections.map(item => {
    const emojiReg = getStartEmojiRegex();

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
  });

  const handleExpandAll = () => {
    const _temps: String[] = [];
    filteredSections.map((item, index) => {
      _temps.push(index);
    });
    setActives(_temps);
  };
  const handleCloseAll = () => {
    setActives([]);
  };
  const handleExpand = _index => {
    if (actives.includes(_index)) {
      actives.splice(actives.indexOf(_index), 1);
      setActives(actives);
    } else {
      setActives([...actives, _index]);
    }
  };

  return (
    <div className={rootStyle} >
      <p className={tw`text-[15px] font-semibold ` + ` mfont-family `} >{data.summary}</p>
      {
        true ? (
          <Collapse
            bordered={false}
            expandIcon={props => {
              const panelId = (props as any).id;

              return (
                filteredSections[panelId]?.startEmojiChar ?? (
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
            {filteredSections.map((section, index) => (
              <Panel
                header={
                  <span className={tw`text-[15px] font-medium`}>
                    {section.brief}
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
          }
        `
                )}
                extra={
                  <Tag
                    color="blue"
                    className={tw`mr-0! w-[90px] flex justify-between`}
                    onClick={event => {
                      if (typeof section.start === 'number') {
                        window.postMessage({
                          type: 'change-video-playback-time',
                          data: section.start
                        });
                      }

                      event.stopPropagation();
                    }}
                  >
                    {typeof section.start === 'number'
                      ? secondToTimeStr(section.start)
                      : section.start}
                    <span>-</span>
                    {typeof section.end === 'number'
                      ? secondToTimeStr(section.end)
                      : section.end}
                  </Tag>
                }
              >
                <p className={tw`text([14.5px] [#333333E5]) relative pl-[8px]`}>
                  {section.detail}
                  <div className={tw`absolute h-full w-[1px] bg-[#0000001a] left-0 top-0`} />
                </p>
              </Panel>
            ))}
          </Collapse>
        ) : (
          <>
            <div className={clsx(tw`bg-transparent flex justify-center`, 'summary-collapse')}>

              <span className={tw(
                `
                cursor-pointer 
    mt-[10px] rounded-[6px]! border-0!  relative
    bg([rgba(0,0,0,.02)] hover:([rgba(0,0,0,0.05)]))`,
                css`
          &:hover .ant-collapse-header[aria-expanded='false'] .click-to-expand {
            display: block;
          }
          &:hover .ant-collapse-header[aria-expanded='false'] {
            padding-bottom: 19px !important;
          }
        `
              )} onClick={()=>{
                window.open(BASE_URL+'/pricing')
              }}>升级课代表解锁分段总结</span>
            </div>
          </>
        )
      }

    </div>
  );
}
