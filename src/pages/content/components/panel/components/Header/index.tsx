import { CheckOutlined, LoadingOutlined, RightOutlined, HighlightOutlined, PlusCircleOutlined } from '@ant-design/icons';
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

export default Header;

let bilibiliLogoJSX: JSX.Element;

function Header(): JSX.Element {
  const user = useUserStore();
  const hasLogin = !!user.token;
  const { setActivedBody, activedBody, showText } = useGlobalStore();
  const { start: startOAuthLogin } = useOAuthStore();
  const { info } = useUserStore();
  const summary = useSummaryStore();
  const [inbox, setInbox] = useState({})
  const [notebooks, setNotebooks] = useState([])
  const iconStyle = tw`text-[19px] cursor-pointer ml-[12px] hover:(text-[#333]! opacity-80)`;
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
  const previewingSummary = activedBody === 'summary' && !summary.requesting;
  const [open, setOpen] = useState(false);
  const [notebookName, setNotebookName] = useState('')
  const [notebookDesc, setNotebookDesc] = useState('')
  const [items, setItems] = useState(initialItems);

  const [confirmLoading, setConfirmLoading] = useState(false);
  let isMove = false
  const showPopconfirm = () => {
    setOpen(true);
  };
  const onTabChange = (key) => {
    if (key === 1) {

      setActivedBody('summary')
    }
    if (key === 2) {

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
  const renderLeftBtnBlock = () => {
    if (hasLogin) {
      if (summary.requesting) {
        return (
          <>
            <LoadingOutlined />
            {summary.isLongLoading ? (
              <span className={tw`text-[15px] ml-1`}>{showText}</span>
            ) : (
              ''
            )}
          </>
        );
      } else if (activedBody === 'summary' || activedBody === 'letter') {
        return (
          <div className={tw`flex tarbar text-base`}>
            <Tabs onChange={onTabChange} type='card'
              items={items}>

            </Tabs>
          </div>    
        )
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
            href="https://kedaibiao.pro/notebook"
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
    className={tw`w-full h-[44px] flex justify-between items-center px-[10px] box-border ` + ` m-header`}
  >
    <div
      className={tw` py-[5px] rounded-[10px] cursor-pointer flex items-center ${!hasLogin && 'w-full'
        }` }
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



function onClickLeftModule() {
  if (hasLogin) {
    if (activedBody === 'preview' || activedBody === 'summary' || activedBody === 'letter') {

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
