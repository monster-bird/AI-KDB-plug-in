import { useOAuthStore } from '@src/pages/common/stores/o-auth';
import { useUserStore } from '@src/pages/common/stores/user';
import { useState} from 'react';
import { useMount } from 'ahooks';
import { Skeleton ,Tabs,Switch} from 'antd';
import { tw } from 'twind';
import { css } from 'twind/css';

import Header from './components/Header';
import Notification from './components/Notification';
import Summary from './components/Summary';
import LetterList from './components/LetterList';

import SummaryPreview from './components/SummaryPreview';

import { getBvid } from './helpers';
import { useGlobalStore } from './stores/global';
import { useSummaryStore } from './stores/summary';

export default Panel;
const initialItems  = [
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

  useMount(function listenBvidChange() {
    setInterval(() => {
      const { currentBvid, cancelCurrentRequest, setCurrentBvid, requesting } =
        useSummaryStore.getState();
      const { setActivedBody, activedBody ,setLetterList} = useGlobalStore.getState();
      const newBvid = getBvid();

      if (currentBvid !== newBvid) {
        setCurrentBvid(newBvid);

        if (requesting) {
          cancelCurrentRequest();
        }

        if (activedBody === 'summary' || activedBody === 'letter') {
          setActivedBody('none');
          setLetterList([])
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
  const { activedBody,setActivedBody, setMode } = useGlobalStore();
  const [items, setItems] = useState(initialItems);
  const onTabChange = (key) => {
    if (key === 1) {
      setActivedBody('summary')
    }
    if (key === 2) {
      setActivedBody('letter')
    }
  }
  const handleActiveChange = (checked) => {
    if (checked)
    setMode('article')
    else {
      setMode('list')
    }
  }
  return (
    <>
    <div className={tw`justify-between flex items-center pr-6`}> 
      {
        activedBody=== 'summary'||activedBody==='letter'? 
        (<div className={tw`flex `}>
        <Tabs  onChange={onTabChange} type='card' 
        items={items}>
         
       </Tabs>
        </div>)
        :''
      }
      {
        activedBody==='letter'?<div>
        <Switch checkedChildren="文章" unCheckedChildren="列表" 
        onChange={handleActiveChange}  />
        </div>:''
      }

      
    </div>
    <div
      className={tw(css`
        transition: height 0.5s;
        background: #f3f3f345;
      `)}
    >
      {(() => {
        switch (activedBody) {
          case 'summary':
            return <Summary />;

          case 'notification':
            return <Notification />;
          case 'preview':
            return <SummaryPreview/>;
          case 'letter':
            return <LetterList/>
          case 'none':
          default:
            return null;
        }
      })()}
    </div>
    </>
  );
}
