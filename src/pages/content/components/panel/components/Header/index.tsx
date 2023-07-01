import { CheckOutlined, LoadingOutlined, RightOutlined } from '@ant-design/icons';
import logo from '@src/assets/img/logo.jpg';
import { axiosInstance } from '@src/pages/common/libs/axios';
import { useOAuthStore } from '@src/pages/common/stores/o-auth';
import { useUserStore } from '@src/pages/common/stores/user';
import { useSetState } from 'ahooks';
import { Tooltip } from 'antd';
import { tw } from 'twind';
import { HighlightOutlined } from '@ant-design/icons';
import {
  createSummaryMarkdown,
  createSummaryShare,
  fleshTimeFormatter
} from '../../helpers';
import { useGlobalStore } from '../../stores/global';
import { useSummaryStore } from '../../stores/summary';
import {
  CopyIcon,
  EmailIcon,
  LetterExtractionIcon,
  LogoutIcon,
  MoneyIcon,
  ShareIcon,
  ThumbsDownIcon,
  ThumbsUpIconj
} from './icons';
import { useEffect } from 'react';

export default Header;

let bilibiliLogoJSX: JSX.Element;
function Header(): JSX.Element {
  const user = useUserStore();
  const hasLogin = !!user.token;
  const { setActivedBody, activedBody } = useGlobalStore();
  const { start: startOAuthLogin } = useOAuthStore();
  const { info } = useUserStore();
  const summary = useSummaryStore();
  const iconStyle = tw`text-[19px] cursor-pointer ml-[12px] hover:(text-[#333]! opacity-80)`;
  const [iconHighlightStates, setIconHighlightStates] = useSetState({
    downLetter: false,
    shareSummary: false,
    copySummary: false
  });
  const previewingSummary = activedBody === 'summary' && !summary.requesting;

  useEffect(()=>{
    const queryString = window.location.search;
    console.log('正在渲染header');
    
    const urlParams = new URLSearchParams(queryString);
    const _p = urlParams.get('bnokw_ldhn_alkdjd');
    if (_p === 'we_dsasd' && hasLogin) {
      onClickLeftModule();
    }
  
  }, [])

  if (!bilibiliLogoJSX) {
    const bilibiliLogoEl = document
      .querySelector('.mini-header__logo')
      ?.cloneNode(true) as HTMLDivElement;

    bilibiliLogoEl.classList.add(tw`h-[23px]`, tw`w-[46px]`, tw`mr-[3px]`);
    bilibiliLogoJSX = (
      <div
        ref={ref => {
          ref?.appendChild(bilibiliLogoEl);
        }}
        className={tw`text-[#00AEEC] flex items-center mx-[3px]`}
      />
    );
  }
  function jsonToSrt(jsonArray) {
    let srtContent = '';
    for (let i = 0; i < jsonArray.length; i++) {
      const subtitle = jsonArray[i];
      const from = msToTime(subtitle.from);
      const to = msToTime(subtitle.to);
      const content = subtitle.content;

      srtContent += `${i + 1}\n${from} --> ${to}\n${content}\n\n`;
    }

    return srtContent;
  }
  function stringToFile(str, summaryTitle) {
    const blob = new Blob([str], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = summaryTitle + '.srt';
    document.body.appendChild(link);
    link.click();

    URL.revokeObjectURL(url);
  }
  function msToTime(duration) {
    duration = duration * 1000;
    let milliseconds = parseInt(duration % 1000),
      seconds = parseInt((duration / 1000) % 60),
      minutes = parseInt((duration / (1000 * 60)) % 60),
      hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    milliseconds =
      milliseconds < 100
        ? milliseconds < 10
          ? '00' + milliseconds
          : '0' + milliseconds
        : milliseconds;

    return hours + ':' + minutes + ':' + seconds + ',' + milliseconds;
  }
  // 下载Handdle
  const handleDownloadLetter = () => {
    setIconHighlightStates({ downLetter: true });

    setTimeout(() => {
      setIconHighlightStates({ downLetter: false });
    }, 2000);
    axiosInstance
      .post('/v1/videos/subtitle', {
        videoId: summary.currentBvid
      })
      .then(data => {
        stringToFile(jsonToSrt(data), summary.currentBvid);
      });
  };

  const renderLeftBtnBlock = () => {
    if (hasLogin) {
      if (summary.requesting) {
        return (
          <>
            <LoadingOutlined />
            {summary.isLongLoading ? (
              <span className={tw`text-[12px] ml-1`}>课代表正在为你记笔记</span>
            ) : (
              ''
            )}
          </>
        );
      } else if (activedBody === 'summary') {
        const _iconStyle = tw(iconStyle, `text-[18px] ml-0 mr-[8px] cursor-pointer`);
        const iconHighlightStyle = tw(
          _iconStyle,
          'text-[#00AEEC] hover:(text-[#00AEEC]!)'
        );

        return (
          <div className={tw`flex items-center`} onClick={e => e.stopPropagation()}>
            {iconHighlightStates.copySummary ? (
              <CheckOutlined className={iconHighlightStyle} />
            ) : (
              <Tooltip title="复制笔记">
              <CopyIcon className={_iconStyle} onClick={copySummary} />
              </Tooltip>
            )}
            {iconHighlightStates.downLetter ? (
              <CheckOutlined className={iconHighlightStyle} />
            ) : (
              <Tooltip title="字幕下载">
              <LetterExtractionIcon
                className={_iconStyle}
                onClick={handleDownloadLetter}
              />
              </Tooltip>
            )}

            {iconHighlightStates.shareSummary ? (
              <CheckOutlined className={iconHighlightStyle} />
            ) : (
              <Tooltip title="分享笔记">

              <ShareIcon className={_iconStyle} onClick={shareSummary} />
              </Tooltip>

            )}
          </div>
        );
      } 
      else if (activedBody === 'preview') {
        
        const _iconStyle = tw(iconStyle, `text-[18px] ml-0 mr-[8px] cursor-pointer`);
        const iconHighlightStyle = tw(
          _iconStyle,
          'text-[#00AEEC] hover:(text-[#00AEEC]!)'
        );
        return (
        <div className={tw`flex items-center`} onClick={e => e.stopPropagation()}>

        {iconHighlightStates.shareSummary ? (
          <CheckOutlined className={iconHighlightStyle} />
        ) : (
          <ShareIcon className={_iconStyle} onClick={shareSummary} />
        )}
      </div>
    );
      }
      else {
        return <span className={tw`flex items-center font-bold`}>帮我记笔记</span>;
      }
    }

    return (
      <div className={tw`flex`}>
        <span className={tw`font-bold flex items-center`}>
          使用
          {bilibiliLogoJSX}
          登录后开始使用 <RightOutlined className={tw`ml-[10px]`} />
        </span>
      </div>
    );
  };

  const renderRightBtnBlock = () => {
    if (hasLogin) {
      const text = (
        <span>
          剩余次数：{info!.remainingCredit}
          <br />
          <span>{fleshTimeFormatter(info.creditResetTime)}后恢复额度</span>
        </span>
      );
      return (
        <>
          <Tooltip title={text}>
            <div className={tw`flex items-center`}>
              <MoneyIcon className={tw(iconStyle, 'text-[18px]')} />
              <span className={tw`ml-[3px] text-[15px]`}>{info!.remainingCredit}</span>
            </div>
          </Tooltip>
          <Tooltip title="我的笔记本">
            <a
              href="https://taichangbukan.cn/notebook"
              target='blank'
              className={tw`inline-flex hover:(text-[#333])`}
            >
              <HighlightOutlined className={tw(iconStyle, `text-[20px]`)} rev={undefined} />
            </a>
          </Tooltip>
          <Tooltip title="退出">
            <LogoutIcon className={iconStyle} onClick={handleLogout} />
          </Tooltip>
        </>
      );
    }
  };

  return (
    <div
      className={tw`w-full h-[44px] flex justify-between items-center px-[10px] box-border`}
    >
      <div
        className={tw`bg-white py-[5px] rounded-[10px] cursor-pointer flex items-center ${
          !hasLogin && 'w-full'
        }`}
        onClick={onClickLeftModule}
      >
        <img
          src={logo}
          className={tw`w-[30px] rounded-[3px] mr-[10px]`}
          onClick={() => {
            if (hasLogin && previewingSummary) {
              setActivedBody('none');
            }
          }}
        />
        <div className={tw('text-[14px] font-bold')}>{renderLeftBtnBlock()}</div>
      </div>
      <div className={tw`flex items-center justify-between`}>{renderRightBtnBlock()}</div>
    </div>
  );

  function onClickThumbs(type: 'up' | 'down') {
    if (type === 'up') {
      setIconHighlightStates({
        thumbsUp: !iconHighlightStates.thumbsUp,
        thumbsDown: false
      });
    } else {
      setIconHighlightStates({
        thumbsUp: false,
        thumbsDown: !iconHighlightStates.thumbsDown
      });
    }
  }
  function shareSummary() {
    navigator.clipboard.write([
      new ClipboardItem({
        'text/plain': new Blob([createSummaryShare(summary!, summary.currentBvid)], {
          type: 'text/plain'
        })
      })
    ]);
    setIconHighlightStates({ shareSummary: true });

    setTimeout(() => {
      setIconHighlightStates({ shareSummary: false });
    }, 2000);
  }
  function copySummary() {
    navigator.clipboard.write([
      new ClipboardItem({
        'text/plain': new Blob([createSummaryMarkdown(summary.data!)], {
          type: 'text/plain'
        })
      })
    ]);

    setIconHighlightStates({ copySummary: true });

    setTimeout(() => {
      setIconHighlightStates({ copySummary: false });
    }, 2000);
  }

  function onClickLeftModule() {
    if (hasLogin) {
      if (activedBody === 'preview' || activedBody === 'summary') {
    setActivedBody('none');

        return
      }
      if (!previewingSummary) {
        summary.start();
      }
    } else {
      startOAuthLogin();
    }
  }

  function handleLogout() {
    user.logout();
    setActivedBody('none');
  }
}
