import { useOAuthStore } from '@src/pages/common/stores/o-auth';
import { useUserStore } from '@src/pages/common/stores/user';
import { useEffect, useState } from 'react';
import { useMount } from 'ahooks';
import { Skeleton, Tabs, Switch, Button, Tooltip, Segmented } from 'antd';
import { mode, tw } from 'twind';
import { css } from 'twind/css';

import Header from './components/Header';
import Notification from './components/Notification';
import Summary from './components/Summary';
import LetterList from './components/LetterList';

import SummaryPreview from './components/SummaryPreview';

import { getBvid, getP } from './helpers';
import { useGlobalStore } from './stores/global';
import { useSummaryStore } from './stores/summary';
import { ExpendAll, ExpendAllRevers, UpdateIcon } from './components/Header/icons';
import BtnArea from './components/BtnArea/BtnArea';
import { axiosInstance } from '@src/pages/common/libs/axios';
import { CheckOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';

export default Panel;
const initialItems = [
  {
    label: `总结`,
    key: 1
  },
  {
    label: '字幕',
    key: 2
  }
]

function Panel(): JSX.Element {
  const { initComplete } = useUserStore();
  const global = useGlobalStore();

  useMount(async function initUser() {
    await useUserStore.getState().init();
    const hasLogin = !!useUserStore.getState().token;

    if (!hasLogin) {
      const { tempState, syncState, clearTempState } = useOAuthStore.getState();

      if (tempState) {
        syncState().finally(clearTempState);
      }
    }
  });
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      const data = event.data

      if (data.type === 'setCurrentTime') {
        global.setCurrentTime(Math.floor(data.data.currentTime))
      }
      if (data.type === 'getLetterList') {
        console.log(data);

        global.setLetterList(data.data)

      }
    }


    window.addEventListener('message', listener)

    return () => {

      window.removeEventListener('message', listener)

    }
  }, [])

  useMount(function listenBvidChange() {
    setInterval(() => {
      const { currentBvid, cancelCurrentRequest, setCurrentBvid, requesting } =
        useSummaryStore.getState();
      const { setActivedBody, activedBody, setLetterList, currentP, init, setCurrentP } = useGlobalStore.getState();
      const newBvid = getBvid();
      const newP = getP();
      if (currentBvid !== newBvid || currentP !== newP) {
        setCurrentBvid(newBvid);
        setCurrentP(newP);
        window.postMessage({ type: 'refreshVideoInfo' }, '*')

        if (requesting) {
          cancelCurrentRequest();
        }

        if (activedBody === 'summary' || activedBody === 'letter') {
          setActivedBody('none');
          setLetterList([])
          init()
        }
      }
    }, 500);
  });

  useMount(function registerGlobalEvent() {
    window.tcbkPanel = {
      toSummarize() {
        return;
        const { start, requesting } = useSummaryStore.getState();
        const hasLogin = !!useUserStore.getState().token;

        if (!requesting && hasLogin) start();
      }
    };
  });

  return (
    <div
      className={tw`
       w-full rounded-[6px] mb-[15px] pointer-events-auto overflow-hidden
        border([2px] solid [#f1f2f3]) box-border`}
      style={{
        borderBottom: '4px solid rgb(241, 242, 243)'
      }}
    >
      {initComplete ? (
        <>
          <Header />
          <Body />
        </>
      ) : (
        <Skeleton.Button block />
      )}
    </div>
  );
}

function Body(): JSX.Element {
  const { activedBody, setActivedBody, setMode, mode, setRealMode, realMode } = useGlobalStore();
  const [expandAll, setExpandAll] = useState(false)
  const [trigger, setTrigger] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const summary = useSummaryStore()

  const handleActiveChange = (key) => {

    setMode(key)

  }
  const handleExpandEvent = () => {
    setExpandAll(true)
    setTrigger(!trigger)
  }
  const handleExpandReEvent = () => {
    setExpandAll(false)
    setTrigger(!trigger)

  }
  const handleUpdateNote = () => {
    setShowLoading(true)
    axiosInstance.delete(`/v2/ai-notes/${summary.currentBvid}`).then(data => {
      setShowLoading(false)
      setActivedBody('none')
      summary.start()
    })
  }
  return (
    <>
      <div className={tw`justify-between flex items-center pl-3  pr-3 m-border`}>
        {
          activedBody === 'summary' || activedBody === 'letter' ?
            (
              // <div className={tw`flex `}>
              //   <Tabs onChange={onTabChange} type='card'
              //     items={items}>

              //   </Tabs>
              // </div>
              <div className={tw`flex h-10`}>
                <BtnArea></BtnArea>
              </div>

            )
            : ''
        }
        {
          activedBody === 'letter' ? <div>
            <Segmented
              className={tw`my-1`}
              onChange={handleActiveChange}
              defaultValue={mode}
              options={[
                {
                  label: '列表',
                  value: 'list'
                },
                {
                  label: '文章',
                  value: 'ariticle'
                },
              ]}
            />
          </div> : ''
        }
        {
          activedBody === 'summary' ? <div>
            {
              summary?.latestModel ? '' :
                showLoading ? <LoadingOutlined rev={undefined} /> :
                  <>
                    <Tooltip title="总结可升级（1-3分钟）">
                      <Button size='small' shape='circle' onClick={handleUpdateNote} icon={<ReloadOutlined rev={undefined} />}>

                      </Button>
                    </Tooltip>
                  </>
            }

            <Tooltip title="展开全部">
              <Button size='small' shape='circle' className={tw`ml-2`} onClick={handleExpandEvent}>
                <ExpendAll className={tw`mt-1`} />

              </Button>
            </Tooltip>
            <Tooltip title="关闭全部">
              <Button size='small' className={tw`ml-2`} shape='circle' onClick={handleExpandReEvent} >
                <ExpendAllRevers className={tw`mt-1`} />
              </Button>
            </Tooltip>

          </div> : ''
        }


      </div>
      <div
        className={tw(css`
        transition: height 0.5s;
        background: #ffffff;
      `)}
      >
        {(() => {
          switch (activedBody) {
            case 'summary':
              return <Summary expandAll={expandAll} trigger={trigger} />;

            case 'notification':
              return <Notification />;
            case 'preview':
              return <SummaryPreview />;
            case 'letter':
              return <LetterList />
            case 'none':
            default:
              return null;
          }
        })()}
      </div>
    </>
  );
}
