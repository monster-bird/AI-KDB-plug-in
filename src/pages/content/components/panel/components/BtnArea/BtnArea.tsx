import React, { useState } from 'react'
import { useGlobalStore } from '../../stores/global';
import { useUserStore } from '@src/pages/common/stores/user';
import { Dropdown, Form, Input, Menu, Popconfirm, Tooltip, message } from 'antd';
import { axiosInstance } from '@src/pages/common/libs/axios';
import { CheckOutlined, LoadingOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { CopyIcon, DeleteIcon, LetterExtractionIcon, NoteIcon } from '../Header/icons';
import { tw } from 'twind';
import { useSetState } from 'ahooks';
import { useSummaryStore } from '../../stores/summary';

export default function BtnArea() {
    const { initComplete } = useUserStore();
    const global = useGlobalStore();
    const summary = useSummaryStore();
    const { setActivedBody, activedBody, showText } = useGlobalStore();
    const [inbox, setInbox] = useState({})
    const [notebooks, setNotebooks] = useState([])
    const [notebookName, setNotebookName] = useState('')
    const [notebookDesc, setNotebookDesc] = useState('')
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [open, setOpen] = useState(false);
    let isMove = false;
    const iconStyle = tw`text-[19px] cursor-pointer ml-[12px] hover:(text-[#333]! opacity-80)`;
    const [iconHighlightStates, setIconHighlightStates] = useSetState({
        downLetter: false,
        shareSummary: false,
        copySummary: false,
        moveNote: false,
        deleteNote: false

    });
    const showPopconfirm = () => {
        setOpen(true);
    };
    const [iconLoadingStates, setIconLoadingStates] = useSetState({
        downLetter: false,
        shareSummary: false,
        copySummary: false,
        moveNote: false,
        deleteNote: false
    })
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
                        <span><PlusCircleOutlined rev={null} /></span>
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
    const handleCancel = () => {
        console.log('Clicked cancel button');
        setOpen(false);
      };
    const handleDescChange = (e) => {
        setNotebookDesc(e.target.value)

    }
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
                        <Input allowClear placeholder="描述" maxLength={10} onChange={handleDescChange} />
                    </Form.Item>
                </Form>
            </div>
        )
    };
    const renderNoteOverlay = () => {

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
                                overlay={() => renderNoteOverlay()}
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
                            overlay={() => renderNoteOverlay(inbox.notebookId)}
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
    )
}
