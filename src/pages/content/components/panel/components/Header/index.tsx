import { CheckOutlined, LoadingOutlined, RightOutlined, HighlightOutlined, PlusCircleOutlined, StarOutlined } from '@ant-design/icons';
import logo from '@src/assets/img/logo.jpg';
import { axiosInstance } from '@src/pages/common/libs/axios';
import { useOAuthStore } from '@src/pages/common/stores/o-auth';
import { useUserStore } from '@src/pages/common/stores/user';
import "@src/assets/style/app.css"
import { useSetState } from 'ahooks';
import { Tooltip, Menu, Dropdown, message, Popconfirm, Button, Form, Input, Tabs } from 'antd';
import { tw } from 'twind';
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
  ThumbsUpIconj,
  NoteIcon,
  DeleteIcon
} from './icons';
import { useEffect, useState } from 'react';
import { useNotificationStore } from '../../stores/notification';

export default Header;

let bilibiliLogoJSX: JSX.Element;

function Header(): JSX.Element {
  const user = useUserStore();
  const hasLogin = !!user.token;
  const { setActivedBody, activedBody, noLetter, setStreamStart, setNoLetter, streamStart, showText, devLog, letterList, setLetterList } = useGlobalStore();
  const { start: startOAuthLogin } = useOAuthStore();
  const { info, token } = useUserStore();
  const summary = useSummaryStore();
  const [inbox, setInbox] = useState({})
  const [notebooks, setNotebooks] = useState([])
  const [selectedKey, setSelectedKey] = useState(0)
  const iconStyle = tw`text-[19px] cursor-pointer ml-[8px] hover:(text-[#333]! opacity-80)`;
  const initialItems = [
    {
      label: `总结`,
      key: 0
    },
    {
      label: '字幕',
      key: 1
    }
  ]
  const [iconHighlightStates, setIconHighlightStates] = useSetState({
    downLetter: false,
    shareSummary: false,
    copySummary: false,
    moveNote: false,
    deleteNote: false

  });
  const [iconLoadingStates, setIconLoadingStates] = useSetState({
    downLetter: false,
    shareSummary: false,
    copySummary: false,
    moveNote: false,
    deleteNote: false
  })
  const previewingSummary = (activedBody === 'summary' || activedBody === 'letter' || activedBody === 'stream') && !summary.requesting;
  const [open, setOpen] = useState(false);
  const [notebookName, setNotebookName] = useState('')
  const [notebookDesc, setNotebookDesc] = useState('')
  const [items, setItems] = useState(initialItems);
  const [selectedItem, setSelectedItem] = useState(-1)
  const [summaryStart, setSummaryStart] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false);
  let isMove = false
  const showPopconfirm = () => {
    setOpen(true);
  };

  useEffect(() => {
    //未点击总结按钮时，直接返回
    if (!streamStart) {
      return
    }

    if (letterList?.length === 0) {
      if (noLetter) {
        summary.start()
        setStreamStart(false)
      }
      window.postMessage({ type: 'refreshVideoInfo' }, '*')


    } else {
      setStreamStart(false)
      devLog('识别到了字幕，开始流总结')
      summary.setLoading(true)
      setActivedBody('stream')

    }
    return () => {
    }

  }, [letterList, streamStart])
  useEffect(()=>{
    if (activedBody === 'stream' || activedBody === "preview" || activedBody === "summary") {
      setSelectedItem(0)
    }else if (activedBody === 'letter') {
      setSelectedItem(1)
    }
  }, [activedBody])
  useEffect(() => {

    const listener = (event: MessageEvent) => {
      const data = event.data


      if (data.type === 'getLetterList') {

        setLetterList(data.data)
        devLog('插件接收到了字幕数据' + data.data?.length);

      }

      if (data.type === 'noLetter') {
        setNoLetter(true)
        devLog('当前不存在字幕');

      }
    }


    window.addEventListener('message', listener)

    return () => {

      window.removeEventListener('message', listener)

    }
  }, [])
  useEffect(() => {

    if (hasLogin) {



    }
    return () => {


    }
  }, [hasLogin])
  let queryCount = 0

  const onTabChange = (key) => {
    setSelectedKey(key)
    if (key === 0) {

      if (info!.remainingCredit >= 0) {
        setActivedBody('summary')

      } else {
        setActivedBody('preview')

      }
    }
    if (key === 1) {

      setActivedBody('letter')

    }
  }

  const handleCancel = () => {
    setOpen(false);
  };
  useEffect(() => {
    const queryString = window.location.search;

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
  const getP = () => {
    const queryString = window.location.search;

    const urlParams = new URLSearchParams(queryString);

    let _p = urlParams.get("p");
    if (!_p) {
      _p = '';
    } else {
      _p = "%3Fp=" + _p;
    }
    return _p;
  }
  const renderLoginBox = () => {
    return (
      <div className={tw`flex`}>
        <span className={tw`font-bold text-[15px] flex items-center`}>
          使用
          {bilibiliLogoJSX}
          登录后开始使用 <RightOutlined className={tw`ml-[10px]`} />
        </span>
      </div>
    )
  }
  const handleSelectTab = (key) => {
    setSelectedKey(key)
      if (key ===0 ) {
        setActivedBody('summary')
      }else {
        setActivedBody('letter')
      }

  }
  const renderLeftBtnBlock = () => {
    if (hasLogin) {
      if (summary.requesting) {
        return (
          ''
        );
      } else if (activedBody === 'stream' || activedBody === 'summary' || activedBody === 'letter' || activedBody === 'preview') {
        return (
          <div className={tw`flex font-medium  h-full text-base relative`}>
            {items.map((item, index) => (
              <div className={tw`flex items-center justify-center cursor-pointer h-full 
              ${selectedItem===index? 'text-[#000000]' : 'text-[#637381]'}
              ${item.key !== 0 ? 'ml-4 ' : ''}`}
                onClick={() => onTabChange(index)}>
                <span>{item.label}</span>
              </div>


            ))}
            <span className={tw` h-1  bg-[#3872e0] absolute`}
              style={{
                left: selectedItem===0? 0 : 48,
                bottom: 0,
                width: 32,
                transition: 'left .32s'
              }}
            ></span>

          </div>
        )
      }
      else {
        return ''
      }
    }
    else {

      return (
        ''
      );
    }

  };
  // const uploadLetterList = () => {
  //   axiosInstance.post(`/v2/ai-notes/${summary.currentBvid}/subtitle`, {
  //     body: letterList
  //   }).then(res => {



  //   }).catch(error => {
  //     console.log(error);

  //   }).finally(() => {
  //     // summary.start();
  //     setActivedBody('stream')
  //     setSummaryStart(false)
  //   })
  // }
  const renderRightBtnBlock = () => {
    if (hasLogin) {
      const text = (
        <span>
          剩余次数：{info!.remainingCredit}
          <br />
          <span>刷新时间：{fleshTimeFormatter(info.creditResetTime)}</span>
        </span>
      );
      return (
        <>
          {/* <Tooltip title="123">
            <StarOutlined className={iconStyle} onClick={handleLogout} rev={undefined} />

          </Tooltip> */}
          <Tooltip title={text}>
            <div className={tw`flex items-center`}>
              <MoneyIcon className={tw(iconStyle, 'text-[18px]')} />
              {/* <span className={tw`ml-[3px] text-[15px]`}>{info!.remainingCredit}</span> */}
            </div>
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
      className={tw`w-full h-[44px] flex justify-between items-center px-[10px] box-border ` + ` m-header`}
    >
      <div
        className={tw` py-[5px] rounded-[10px]  flex items-center ${!hasLogin && 'w-full'
          }`}
        onClick={onClickLeftModule}
      >
        <div className={tw`flex items-center`}>

          <img
            src={logo}
            className={tw`w-[30px] rounded-[3px] cursor-pointer mr-[10px]`}
            onClick={() => {
              if (hasLogin && previewingSummary) {
                setActivedBody('none');
              }
            }}
          />
          {
            ((activedBody === 'summary' || activedBody === 'letter' || activedBody === 'preview' || activedBody === 'stream') && !summary.requesting) ?
                <span className={tw`flex items-center h-full text-[15px] font-bold`}>AI课代表</span>
              : ''
          } {
            hasLogin && activedBody === 'none' && !summary.requesting ?
              <span className={tw`flex cursor-pointer items-center text-[15px] font-bold`}>帮我记笔记</span> : ''
          }
          {hasLogin && summary.requesting ?
            <>
              <LoadingOutlined />
              {summary.isLongLoading ? (
                <span className={tw`text-[15px] ml-1 font-bold`}>{showText}</span>
              ) : (
                ''
              )}
            </> : ''
          }
          {
            !hasLogin ? renderLoginBox() : ''
          }
        </div>

      </div>
      <div className={tw('text-[15px] font-bold h-full')}>{renderLeftBtnBlock()}</div>

      <div className={tw`flex items-center justify-between`}>{renderRightBtnBlock()}</div>
    </div>
  );



  function onClickLeftModule() {
    if (hasLogin) {
      if (activedBody === 'preview' || activedBody === 'summary' || activedBody === 'letter' || activedBody === 'stream') {

        return
      }
      if (!previewingSummary) {
        summary.setLoading(true)

        axiosInstance.get(`/v2/ai-notes/${summary.currentBvid}${getP()}/preview`).then(res => {
          if (res.summaryCode === 100) {
            // setActivedBody('stream')
            summary.start()
          } else {
            if (letterList?.length > 0) {

              // uploadLetterList()

              setActivedBody('stream')

              return
            } else {
              setStreamStart(true)
            }


          }

        })

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
