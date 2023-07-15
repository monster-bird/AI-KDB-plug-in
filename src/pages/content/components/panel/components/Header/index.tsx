import { CheckOutlined, LoadingOutlined, RightOutlined, HighlightOutlined, PlusCircleOutlined } from '@ant-design/icons';
import logo from '@src/assets/img/logo.jpg';
import { axiosInstance } from '@src/pages/common/libs/axios';
import { useOAuthStore } from '@src/pages/common/stores/o-auth';
import { useUserStore } from '@src/pages/common/stores/user';
import  "@src/assets/style/app.css"
import { useSetState } from 'ahooks';
import { Tooltip, Menu, Dropdown, message, Popconfirm, Button, Form, Input } from 'antd';
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
  const { setActivedBody, activedBody } = useGlobalStore();
  const { start: startOAuthLogin } = useOAuthStore();
  const { info } = useUserStore();
  const summary = useSummaryStore();
  const [inbox, setInbox] = useState({})
  const [notebooks, setNotebooks] = useState([])
  const iconStyle = tw`text-[19px] cursor-pointer ml-[12px] hover:(text-[#333]! opacity-80)`;
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
  const [confirmLoading, setConfirmLoading] = useState(false);
  let isMove = false
  const showPopconfirm = () => {
    setOpen(true);
  };
  const handleOk = () => {
    if (notebookName === '') {
      message.error('请输入笔记本名称')
      return
    }
    setConfirmLoading(true);

    axiosInstance
      .post("/v2/notebooks", {
        title: notebookName,
        description: notebookDesc
      })
      .then((res) => {
        setOpen(false);

        setConfirmLoading(false);


        message.success("添加成功");

      });

  };
  const handleCancel = () => {
    console.log('Clicked cancel button');
    setOpen(false);
  };
  useEffect(() => {
    const queryString = window.location.search;
    console.log('正在渲染header');

    const urlParams = new URLSearchParams(queryString);
    const _p = urlParams.get('bnokw_ldhn_alkdjd');
    if (_p === 'we_dsasd' && hasLogin) {
      onClickLeftModule();
    }

    getNotebookData()


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
  const  getNotebookData = () => {
    axiosInstance.get('/v2/notebooks').then(res=>{
      setNotebooks(res.custom)
      setInbox(res.inbox)
    })
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
  function stringToFile(str) {
    const blob = new Blob([str], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = summary.currentBvid + '.srt';
    document.body.appendChild(link);
    link.click();

    URL.revokeObjectURL(url);
  }
  function msToTime(duration: number) {
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
  // const handleDownloadLetter = () => {
  //   setIconHighlightStates({ downLetter: true });

  //   setTimeout(() => {
  //     setIconHighlightStates({ downLetter: false });
  //   }, 2000);
  //   axiosInstance
  //     .post('/v1/videos/subtitle', {
  //       videoId: summary.currentBvid
  //     })
  //     .then(data => {
  //       stringToFile(jsonToSrt(data), summary.currentBvid);
  //     });
  // };
  const handleComment = () => {
    if (!summary.currentBvid) {
      message.error("尚未开始总结！");
      return;
    }

    setIconLoadingStates({ copySummary: true })

    axiosInstance
      .get(`/v2/ai-notes/${summary.currentBvid}/comment`)
      .then((res) => {
        navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': new Blob([res], {
              type: 'text/plain'
            })
          })
        ]);
        setIconLoadingStates({ copySummary: false })
        setIconHighlightStates({ copySummary: true });
        setTimeout(() => {
          setIconHighlightStates({ copySummary: false });
        }, 2000);
      });
  };
  const handleDownloadLetter = () => {
    if (!summary.currentBvid) {
      message.error("尚未开始总结，不能下载！");
      return;
    }
    setIconLoadingStates({ downLetter: true });


    axiosInstance
      .get(`/v2/ai-notes/${summary.currentBvid}/subtitle`)
      .then((res) => {
        stringToFile(jsonToSrt(res));
        setIconLoadingStates({ downLetter: false });

        setIconHighlightStates({ downLetter: true });
        setTimeout(() => {
          setIconHighlightStates({ downLetter: false });
        }, 2000);

      });
  };


  const handleShare = () => {
    // navigator.clipboard.write([
    //   new ClipboardItem({
    //     'text/plain': new Blob([createSummaryMarkdown(summaryTitle, summaryInfo.results)], {
    //   type: 'text/plain'
    //   })
    // })
    // ]);
    // const blob = new Blob(['Hello, world!'], { type: 'text/plain' });
    if (!summary.currentBvid) {
      message.error("尚未开始总结！");
      return;
    }
    setIconLoadingStates({ copySummary: true })


    axiosInstance
      .get(`/v2/ai-notes/${summary.currentBvid}/share`)
      .then((res) => {
        console.log(res);
        navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': new Blob([res], {
              type: 'text/plain'
            })
          })
        ]);
        setIconLoadingStates({ copySummary: false });
        setIconHighlightStates({ copySummary: true });
        setTimeout(() => {
          setIconHighlightStates({ copySummary: false });
        }, 2000);

      });
  };
  const handleCopy = () => {
    // navigator.clipboard.write([
    //   new ClipboardItem({
    //     'text/plain': new Blob([createSummaryMarkdown(summaryTitle, summaryInfo.results)], {
    //   type: 'text/plain'
    //   })
    // })
    // ]);
    // const blob = new Blob(['Hello, world!'], { type: 'text/plain' });
    if (!summary.currentBvid) {
      message.error("尚未开始总结！");
      return;
    }
    setIconLoadingStates({ copySummary: true })

    axiosInstance
      .get(`/v2/ai-notes/${summary.currentBvid}/copy`)
      .then((res) => {

        navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': new Blob([res], {
              type: 'text/plain'
            })
          })
        ]);
        setIconLoadingStates({ copySummary: false })

        setIconHighlightStates({ copySummary: true });
        setTimeout(() => {
          setIconHighlightStates({ copySummary: false });
        }, 2000);



      });
  };

  const renderSummaryOverlay = (noteId) => {
    if (isMove || notebooks?.length === 0) {
      getNotebookData()
      isMove = false
    }



    return (
      <Menu>
        <Menu.Item key={inbox.notebookId} onClick={(e) => handleMove(e, noteId)}>
          <div className={tw`border-b-2 border-gray-100 pb-1 border-b-solid`} ><span className={tw`inline-flex mr-1`}>收件箱</span>{summary.currentNotebookId === inbox.notebookId ? <CheckOutlined /> : ''} </div>
        </Menu.Item>
        {
          notebooks?.length > 0 ?
            notebooks.map((item, index) => (
              <Menu.Item
                key={item.notebookId}
                onClick={(e) => handleMove(e, noteId, item)}
              >
                <div><span className={tw`inline-flex mr-1 `}>{item.title}</span>{summary.currentNotebookId === item.notebookId ? <CheckOutlined /> : ''}</div>
              </Menu.Item>
            )) : ''

        }
        <Menu.Item key={-1}>


          <div onClick={showPopconfirm}>
            <span><PlusCircleOutlined /></span>
            <span
              className={tw`inline-flex ml-1`}
            >
              新建笔记本
            </span>
          </div>


        </Menu.Item>
      </Menu>
    );
  };
  const handleMove = (e, noteId, notebookId) => {
    console.log(summary);
    setIconLoadingStates({ moveNote: true });

    axiosInstance
      .put(`/v2/notebooks/${summary.currentNotebookId}/notes`, {
        destNotebookId: e.key,
        noteIdList: [summary.currentNoteId],
      })
      .then((res) => {
        isMove = true
        console.log(e.key);
        summary.setCurrentNotebookId(e.key);
        message.success("移动成功");
        setIconLoadingStates({ moveNote: false });
        setIconHighlightStates({ moveNote: true });
        setTimeout(() => {
          setIconHighlightStates({ moveNote: false });
        }, 2000);
      });
  };
  const handleDescChange = (e) => {
    setNotebookDesc(e.target.value)

  }
  const handleNameChange = (e) => {
    setNotebookName(e.target.value)
  }
  const handleDeleteNote = () => {
    setIconLoadingStates({ deleteNote: true });

    axiosInstance
      .delete(`/v2/notebooks/${summary.currentNotebookId}/notes`, {
        data: JSON.stringify({
          noteIdList: [summary.currentNoteId],
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        message.success("删除成功");
        setActivedBody('none')

        setIconLoadingStates({ deleteNote: false });
        setIconHighlightStates({ deleteNote: true });
        setTimeout(() => {
          setIconHighlightStates({ deleteNote: false });
        }, 2000);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const renderAddNotebook = () => {
    return (
      <div className="add-notebook-area">
        <Form >
          <Form.Item
            name="title"
            label="名称 "
            rules={[
              { required: true, message: "请输入内容" },
              { max: 10, message: "最多只能输入10个字符" },
            ]}
          >
            <Input
              showCount
              placeholder="笔记本名称"
              allowClear
              maxLength={10}
              onChange={handleNameChange}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述 "
            className='desc'
            rules={[{ max: 30, message: "最多只能输入30个字符" }]}
          >
            <Input  allowClear placeholder="描述" maxLength={10} onChange={handleDescChange} />
          </Form.Item>
        </Form>
      </div>
    )
  };
  const renderOverlay = () => {

    return (
      <Menu>
        <Menu.Item key={1} onClick={() => handleCopy()}>
          <div>复制全文</div>
        </Menu.Item>
        <Menu.Item key={2} onClick={() => handleComment()}>
          <div>复制到评论区</div>
        </Menu.Item>
        <Menu.Item key={3} onClick={() => handleShare()}>
          <div>分享给朋友</div>
        </Menu.Item>

      </Menu>
    );
  };
  const renderLeftBtnBlock = () => {
    if (hasLogin) {
      if (summary.requesting) {
        return (
          <>
            <LoadingOutlined />
            {summary.isLongLoading ? (
              <span className={tw`text-[15px] ml-1`}>课代表正在写笔记...</span>
            ) : (
              ''
            )}
          </>
        );
      } else if (activedBody === 'summary' || activedBody === 'letter') {
        const _iconStyle = tw(iconStyle, `text-[18px] ml-0 mr-[8px] cursor-pointer`);
        const iconHighlightStyle = tw(
          _iconStyle,
          'text-[#00AEEC] hover:(text-[#00AEEC]!)'
        );

        return (
          <div className={tw`flex items-center`} onClick={e => e.stopPropagation()}>
            {
              iconLoadingStates.copySummary ?
                <LoadingOutlined className={iconHighlightStyle} rev={undefined} /> :

                iconHighlightStates.copySummary ? (
                  <CheckOutlined className={iconHighlightStyle} rev={undefined} />
                ) : (
                  <Tooltip title="复制笔记">
                    <Dropdown
                      overlay={() => renderOverlay()}
                      arrow={{ pointAtCenter: true }}>
                      <CopyIcon className={_iconStyle} />
                    </Dropdown>
                  </Tooltip>
                )}
            {iconLoadingStates.downLetter ?
              <LoadingOutlined className={iconHighlightStyle} rev={undefined} /> :
              iconHighlightStates.downLetter ? (
                <CheckOutlined className={iconHighlightStyle} rev={undefined} />
              ) : (
                <Tooltip title="字幕下载">
                  <LetterExtractionIcon
                    className={_iconStyle}
                    onClick={handleDownloadLetter}
                  />
                </Tooltip>
              )}
            {iconLoadingStates.moveNote ?
              <LoadingOutlined className={iconHighlightStyle} rev={undefined} /> :
              iconHighlightStates.moveNote ? (
                <CheckOutlined className={iconHighlightStyle} rev={undefined} />
              ) : (
                <Tooltip title="存到笔记本">
                  <Dropdown
                    overlay={() => renderSummaryOverlay(inbox.notebookId)}
                    arrow={{ pointAtCenter: true }}
                  >
                    <Popconfirm
                      icon={<PlusCircleOutlined />}
                      title="添加笔记本"
                      description={renderAddNotebook()}
                      open={open}
                      onConfirm={handleOk}
                      okText="提交"
                      cancelText="取消"
                      okButtonProps={{ loading: confirmLoading }}
                      onCancel={handleCancel}
                    >
                      <NoteIcon className={_iconStyle} />
                    </Popconfirm>
                  </Dropdown>
                </Tooltip>)}
            {iconLoadingStates.deleteNote ?
              <LoadingOutlined className={iconHighlightStyle} rev={undefined} /> :
              iconHighlightStates.deleteNote ? (
                <CheckOutlined className={iconHighlightStyle} rev={undefined} />
              ) : (
                <Tooltip title="删除该笔记">
                  <DeleteIcon
                    className={_iconStyle}
                    onClick={handleDeleteNote}
                  />
                </Tooltip>)}
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
      className={tw`w-full h-[44px] flex justify-between items-center px-[10px] box-border`}
    >
      <div
        className={tw`bg-white py-[5px] rounded-[10px] cursor-pointer flex items-center ${!hasLogin && 'w-full'
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
