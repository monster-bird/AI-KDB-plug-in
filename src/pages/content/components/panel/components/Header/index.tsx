import { CheckOutlined, LoadingOutlined, RightOutlined, HighlightOutlined, PlusCircleOutlined, StarOutlined, EllipsisOutlined } from '@ant-design/icons';
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
  const { info } = useUserStore();
  const summary = useSummaryStore();
  const iconStyle = tw`text-[19px] cursor-pointer ml-[8px] hover:(text-[#333]! opacity-80)`;
  const initialItems = [
    {
      label: `总结`,
      key: 0
    },
    {
      label: '字幕',
      key: 1
    },
    {
      label: '提问',
      key: 2
    }
  ]

  const previewingSummary = (activedBody === 'summary' || activedBody === 'letter' || activedBody === 'stream' || activedBody === 'question') && !summary.requesting;
  const [tipText, setTipText] = useState(<></>)
  const [items, setItems] = useState(initialItems);
  const [selectedItem, setSelectedItem] = useState(-1)


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

  }, [letterList, streamStart, noLetter])
  useEffect(() => {
    if (hasLogin) {
      setTipText(<span>
        剩余次数：{info!.remainingCredit}
        <br />
        <span>刷新时间：{fleshTimeFormatter(info.creditResetTime)}</span>
      </span>)
    }
  }, [hasLogin, info])
  useEffect(() => {
    if (activedBody === 'stream' || activedBody === "preview" || activedBody === "summary") {
      setSelectedItem(0)
    } else if (activedBody === 'letter') {
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


  const onTabChange = (key) => {
    setSelectedItem(key)
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
    if (key === 2) {
      setActivedBody('question')
    }
  }

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

    bilibiliLogoEl?.classList.add(tw`h-[23px]`, tw`w-[46px]`, tw`mr-[3px]`);
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

  const renderLeftBtnBlock = () => {
    if (hasLogin) {
      if (summary.requesting) {
        return (
          ''
        );
      } else if (activedBody !== 'none' && activedBody !== 'notification') {
        return (
          <div className={tw`flex font-medium  h-full text-base relative`}>
            {items.map((item, index) => (
              <div className={tw`flex items-center justify-center cursor-pointer h-full 
              ${selectedItem === index ? 'text-[#000000]' : 'text-[#637381]'}
              ${item.key !== 0 ? 'ml-4 ' : ''}`}
                onClick={() => onTabChange(index)}>
                <span>{item.label}</span>
              </div>


            ))}
            <span className={tw` h-1  bg-[#3872e0] absolute`}
              style={{
                left: 48 * selectedItem,
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
  const rightOverlay = () => {
    return (
      <Menu>
        <Menu.Item key={1}>
          <div onClick={handleLogout}>
            <span><LogoutIcon  /></span>
            <span
              className={tw`inline-flex ml-1`}
            >
              退出登录
            </span>
          </div>
        </Menu.Item>
      </Menu>
    )
  }
  const handleOpen = () => {
    window.open('https://kedaibiao.pro')
  }
  const renderRightBtnBlock = () => {
    if (hasLogin) {

      return (
        <>
          {/* <Tooltip title="123">
            <StarOutlined className={iconStyle} onClick={handleLogout} rev={undefined} />

          </Tooltip> */}


          <Dropdown overlay={() => rightOverlay()}>
          <EllipsisOutlined className={iconStyle} rev={undefined} />

          </Dropdown>
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

            (activedBody !== 'none' && activedBody !== 'notification' && !summary.requesting) ?
              <Tooltip title={tipText}>

                <span className={tw`flex items-center h-full text-[15px] cursor-pointer font-bold`}
                  onClick={handleOpen}>AI课代表</span>
              </Tooltip>

              : ''
          } {
            hasLogin && (activedBody === 'none'|| activedBody === 'notification') && !summary.requesting ?
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
        useGlobalStore.getState().setShowText("");

        axiosInstance.get(`/v2/ai-notes/${summary.currentBvid}${getP()}/preview`).then(res => {
          
          if (res.summaryCode === 100) {
            // setActivedBody('stream')
            summary.start()
          } 
          
          else if (res.summaryCode === 301) {
            console.log(info?.remainingCredit);
            
            if (info?.remainingCredit < 0) {
              useNotificationStore.getState().show({
                type: "warning",
                message: `今日额度已用尽，${fleshTimeFormatter(info.creditResetTime)}后刷新~`,
              });
            useSummaryStore.getState().setLoading(false)

              return
            }
            summary.start()


          }
          else {
            if (info?.remainingCredit < 0) {
              summary.start()

              return
            }
            if (letterList?.length > 0) {

              // uploadLetterList()

              setActivedBody('stream')

              return
            } else {
              setStreamStart(true)
            }


          }

        }).catch(e=>{
          
          summary.start()
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
