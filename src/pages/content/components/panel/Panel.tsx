import { useOAuthStore } from '@src/pages/common/stores/o-auth';
import { useUserStore } from '@src/pages/common/stores/user';
import { useMount } from 'ahooks';
import { Skeleton } from 'antd';
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
      const { setActivedBody, activedBody } = useGlobalStore.getState();
      const newBvid = getBvid();

      if (currentBvid !== newBvid) {
        setCurrentBvid(newBvid);

        if (requesting) {
          cancelCurrentRequest();
        }

        if (activedBody === 'summary') {
          setActivedBody('none');
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
  const { activedBody } = useGlobalStore();

  return (
    <div
      className={tw(css`
        transition: height 0.5s;
        ${activedBody !== 'none' && 'border-top: 2px solid #f1f2f3;'}
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
  );
}``
