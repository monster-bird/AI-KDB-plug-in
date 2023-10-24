import { Button, Skeleton, Tooltip } from 'antd';
import { useEffect, useState } from 'react';

import TextArea from 'antd/es/input/TextArea';
import { tw } from 'twind';
import { API_BASE_URL } from '@src/pages/common/constants';
import { useGlobalStore } from '../stores/global';
import { useUserStore } from '@src/pages/common/stores/user';
import { useSummaryStore } from '../stores/summary';
import { getP } from '../helpers';
import { CopyIcon } from './Header/icons';
import { BorderOutlined, CheckOutlined, SyncOutlined } from '@ant-design/icons';
import MarkdownComponent from './MarkdownComponent';
import { useQuestionStore } from '../stores/question';
import { axiosInstance } from '@src/pages/common/libs/axios';


export default Question;
let isCancelled = false;

function Question(): JSX.Element {
    const [isTyping, setIsTyping] = useState(false)
    const {
        answerText,
        queryString,
        addAnswerText,
        questionLoading,
        setQueryString,
        typingStart,
        setTypingStart,
        isStart,
        setIsStart,
        setAnswerText,
        setIsComplete,
        setQuestionLoading,
        isFirst,
        setIsFirst
    } = useQuestionStore()
    const summary = useSummaryStore();
    const { letterList, getLetterData } = useGlobalStore()
    const { info, setCredit } = useUserStore()
    const [timeList, setTimeList] = useState([])
    const [showAll, setShowAll] = useState(false)
    const [isCopyed, setIsCopyed] = useState(false)
    const [lastQuery, setLastQuery] = useState('')
    const [showInput, setShowInput] = useState(true)
    const [beAnswering, setBeAnswering] = useState(false)
    const iconStyle = tw`text-[19px] cursor-pointer ml-[12px] hover:(text-[#333]! opacity-80)`;

    const _iconStyle = tw(iconStyle, `text-[18px] ml-0 mr-[8px] cursor-pointer`);
    useEffect(() => {
        // 查找具有特定类名的所有<a>标签
        const anchors = document.querySelectorAll('.ref-tag');

        // 为每个<a>标签添加点击事件处理程序
        anchors.forEach(anchor => {
            anchor.addEventListener('click', handleClickTag);
        });

        // 清理函数 - 组件卸载时删除事件监听器
        return () => {
            anchors.forEach(anchor => {
                anchor.removeEventListener('click', handleClickTag);
            });
        };
    }, [timeList]); // 依赖数组为空，所以此效果仅在挂载和卸载时运行
    function handleClickTag(event) {
        // 获取data-time属性的值
        const time = event.target.getAttribute('data-time');
        window.postMessage({
            type: 'change-video-playback-time',
            data: time
        });
        // 在这里你可以根据需要执行其他操作
    }
    useEffect(() => {
        if (letterList.length === 0) {

            getLetterData()

        } else {
            setQuestionLoading(false)
        }
    }, [])
    const onChange = (e) => {
        setQueryString(e.target.value)
    }
    const handleSubmit = () => {
        if (queryString === '') return

        if (info?.remainingCredit < 0) {
            window.open('https://kedaibiao.pro/price')
            return
        }
        setTimeList([])
        setIsStart(true)
        setAnswerText('')
        setIsTyping(true)
        setTypingStart(false)
        setBeAnswering(true)
        setIsComplete(false)
        setLastQuery(queryString)
        isCancelled = false
        fetchData()
    }
    const handleClickTime = (_time: number) => {
        let index = findLetter(_time)
        if (index < 0) return
        if (index === 0) {
            window.postMessage({
                type: 'change-video-playback-time',
                data: _time
            });
        } else if (index >= 1) {

            window.postMessage({
                type: 'change-video-playback-time',
                data: letterList[index - 1]?.from
            });
        }

        event.stopPropagation();


    }
    let count = 1;
    function replaceCiteNumbersWithCount(input: string): string {
        if (!input) return ''
        // let cleanedInput = input?.replace(/\$CITE_{(\d+(\.\d+)?)\}\$/g, /\s?\$CITE_{(\d+(\.\d+)?)\}\$\s?/g
        let cleanedInput = input?.replace(/\s?\$CITE_\{(\d+(\.\d+)?)\}\$\s?/g,
            (_, number) => {
                if (findLetter(number) >= 0) {
                    return `<a class="ref-tag" data-time="${number}">${count++}</a>`

                } return ''
            });
        cleanedInput = cleanedInput?.replace(/\s?\$CITE_(.*?)\$\s?/g, '');
        return cleanedInput;
    }
    function replaceCiteNumbersWithCopy(input: string): string {
        if (!input) return ''
        let count = 1
        // let cleanedInput = input?.replace(/\$CITE_{(\d+(\.\d+)?)\}\$/g, /\s?\$CITE_{(\d+(\.\d+)?)\}\$\s?/g
        let cleanedInput = input?.replace(/\s?\$CITE_\{(\d+(\.\d+)?)\}\$\s?/g,
            (_, number) => {
                if (findLetter(number) >= 0) {
                    return `[${count++}]`

                } return ''
            });
        cleanedInput = cleanedInput?.replace(/\s?\$CITE_(.*?)\$\s?/g, '');
        return cleanedInput;
    }
    function replaceCiteNumbersWithNumber(input: string): string {
        if (!input) return ''
        // let cleanedInput = input?.replace(/\$CITE_{(\d+(\.\d+)?)\}\$/g, /\s?\$CITE_{(\d+(\.\d+)?)\}\$\s?/g
        let cleanedInput = input?.replace(/\s?\$CITE_\{(\d+(\.\d+)?)\}\$\s?/g,
            (_, number) => {
                if (findLetter(number) >= 0) {
                    return `{￥${number}￥}`

                } return ''
            });
        cleanedInput = cleanedInput?.replace(/\s?\$CITE_(.*?)\$\s?/g, '');
        return cleanedInput;
    }
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchData = async () => {
        const data = { q: queryString };


        try {
            const resp = await fetch(`${API_BASE_URL}/v2/ai-notes/${summary.currentBvid}${getP()}/qa`, {
                method: 'post',
                body: JSON.stringify(data),
                signal: signal,
                headers: {
                    'Authorization': `Bearer ${useUserStore.getState().token}`,
                    'Content-Type': 'application/json'
                },

            })
            const reader = resp.body.getReader();
            const textDecoder = new TextDecoder()
            while (1) {
                if (isCancelled) {
                    break; // 跳出循环，停止读取
                }
                const { done, value } = await reader.read()
                if (done) {
                    setIsTyping(false)
                    setBeAnswering(false)
                    setIsComplete(true)
                    setIsFirst(false)
                    break;
                }

                const str = textDecoder.decode(value)
                const _list = str.split('\n\n')
                _list.forEach(value => {
                    const _lineList = value.split('\n')

                    if (_lineList[0].includes('personal')) {
                        const _objList = _lineList[1].split('data: ')
                        if (_objList.length > 1) {

                            let obj = JSON.parse(_objList[1])
                            setTypingStart(true)
                            const credit = {
                                remainingCredit: obj.body.remainingCredit,
                                totalCredit: obj.body.totalCredit,
                                creditResetTime: obj.body.creditResetTime,
                            }
                            setCredit(credit);
                        }
                    }
                    if (_lineList[0].includes('answer')) {
                        const _objList = _lineList[1].split('data: ')
                        if (_objList.length > 1) {

                            let obj = JSON.parse(_objList[1])

                            addAnswerText(obj.body)

                        }
                    }
                })

            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
            } else {
                // 处理其他错误
            }
        }
    }
    useEffect(() => {
        if (answerText.length < 5) return
        let _numberText = replaceCiteNumbersWithNumber(answerText)
        const matches = _numberText.match(/￥(\d+(\.\d+)?)￥/g);
        const numbers = matches ? matches.map(match => match.match(/￥(\d+(\.\d+)?)￥/)[1]) : [];

        // const numbers = matches.map(match => match.match(/\$CITE_{(\d+(\.\d+)?)\}\$/)[1]);
        if (numbers.length > 0) {
            setTimeList(numbers);
        }
    }, [answerText])

    const handleCopy = () => {
        // let text = `\n《${useSummaryStore.getState().data?.title}》\n小学渣：${lastQuery}\n课代表：${replaceCiteNumbersWithCopy(answerText)}\n\n参考信息：\n${timeList.map((time, index) => ` [${index}]: ${renderTip(findLetter(time))+'('+secondToTimeStr(time)+')'}`).join('\n')}
        // `
        // let list = timeList.map((time, index)=>{
        //     return [time, renderTip(findLetter(time))]

        // })

        // navigator.clipboard.write([
        //     new ClipboardItem({
        //         'text/plain': new Blob([text], {
        //             type: 'text/plain'
        //         })
        //     })
        // ]);
        // setTimeout(() => {
        //     setIsCopyed(false)

        // }, 2000)
        setIsCopyed(true)

        axiosInstance.post(`/v2/ai-notes/${summary.currentBvid}/qa_share`, {
            title: summary.data?.title,
            abstract: '',
            question: lastQuery,
            answer: replaceCiteNumbersWithCopy(answerText),
            ref: timeList.map((time, index) => [parseFloat(time), renderTip(findLetter(time))])
        }).then(data => {
            navigator.clipboard.write([
                new ClipboardItem({
                    'text/plain': new Blob([data], {
                        type: 'text/plain'
                    })
                })
            ]);
            setTimeout(() => {
                setIsCopyed(false)

            }, 2000)
        })
    }
    const findLetter = (time: number): number => {

        // letterList.(value => {
        //     if (time<=value.from) {
        //         returnStr =  value.content
        //         return
        //     }

        // })

        for (let index = 0; index < letterList.length; index++) {
            const element = letterList[index];

            if (Math.floor(time) >= Math.floor(element.from) && Math.floor(time) <= Math.floor(element.to)) {
                return index
            }

        }

        return -1
    }
    const handleRebuild = () => {

        if (isTyping) {
            controller.abort()
            setIsTyping(false)
            isCancelled = true
            setBeAnswering(false)
            setIsComplete(true)
        } else {
            handleSubmit()
        }
    }
    const handleKeyPress = (event) => {

        if (event.key === 'Enter' && event.shiftKey) {
            // 当Shift+Enter被按下时，在光标位置插入换行符
            const start = event.target.selectionStart;
            const end = event.target.selectionEnd;
            const newValue =
                queryString.substring(0, start) + '\n' + queryString.substring(end);

            setQueryString(newValue);

            // 将光标放置在插入的换行符之后
            setTimeout(() => {
                event.target.selectionStart = start + 1;
                event.target.selectionEnd = start + 1;
            }, 0);

            event.preventDefault(); // 阻止默认Enter行为
            return
        }
        if (event.key === 'Enter') {
            // 在这里调用你想要触发的函数
            event.preventDefault();
            handleSubmit()
            return
        }
    }
    const renderTip = (index: number): string => {
        let leftStr = ''
        let rightStr = ''

        if (index < 0) {
            return ''
        }
        try {
            if (index >= 1) {
                leftStr = letterList[index - 1].content
            }
            if (index < letterList.length - 1) {
                rightStr = letterList[index + 1].content
            }
        } catch (erryr) {

        }

        return leftStr + '，' + letterList[index].content + '，' + rightStr

    }

    if (questionLoading) {
        return (
            <>
                <div className={tw`h-96 pl-3 pr-3 mt-3`}>
                    <Skeleton className={tw`mt-3`} active />
                    <Skeleton className={tw`mt-3`} active />
                    <Skeleton className={tw`mt-3`} active />
                </div>
            </>
        )
    }
    // 合并content和citations到一个数组
    return (
        <div className={tw``}>
            <div className={tw`box-border pt-[5px] pl-[10px] pr-[10px] pb-[10px] border-b `}>
                <div className={tw`mt-2`}>

                    <TextArea
                        allowClear={true}
                        maxLength={100}
                        style={{ height: 80, resize: 'none' }}
                        onChange={onChange}
                        value={queryString}
                        placeholder="在这里输入您要提问的问题"
                        onKeyDown={handleKeyPress}
                    />
                </div>
                {
                    showInput ? (<div className={tw`mt-1`}>
                        <Button type='primary' block loading={beAnswering} disabled={letterList.length === 0} onClick={handleSubmit}>
                            {
                                info?.remainingCredit < 0 ?
                                    '提高额度'
                                    : (beAnswering ?

                                        (isFirst ? answerText ? '回答中...' : '建立索引中' : '回答中...')
                                        : (letterList.length === 0 ?
                                            '该视频没有字幕'
                                            : '不懂就问（Enter）'))
                            }
                        </Button>

                    </div>) : ''
                }

            </div>
            <div className={tw`border-gray-200 border-t-solid border-t  pt-[10px] pb-[10px] pl-[10px] pr-[10px]`}>
                {
                    isStart ?
                        <div className={tw`flex justify-between items-center`}>
                            <div>{answerText ?
                                (isCopyed ?
                                    <CheckOutlined className={_iconStyle} rev={undefined} /> :
                                    <Tooltip title="复制答案">
                                        <CopyIcon onClick={handleCopy} className={_iconStyle} />
                                    </Tooltip>) : ''
                            }
                            </div>
                            <div>
                                <Button
                                    onClick={handleRebuild}
                                    icon={isTyping ? <BorderOutlined rev={undefined} /> : <SyncOutlined rev={undefined} />}>{isTyping ? '停止生成' : '重新生成'}</Button>
                            </div>

                        </div> : ''
                }

                <div className={tw`mt-2  `}>
                    {/* <p className={tw`mh-3 text-[15px] ` + `${isTyping ? '     cursor-after' : ''}`}
                    >{result.length === 0 ? (
                        ) : result.map((part, index) => (
                            part.match(/\$CITE_{(.+?)}\$/) ? (part !== ' ' ? (
                                <span key={index} className={`text-tag`} onClick={() => handleClickTime(part)}>{count++}</span>

                            ) : '') : (
                                <span key={index}>{part}</span>
                            )

                        ))}</p> */
                        !isStart ?
                            <div className={tw`text-gray-400`}>






                            </div> :

                            <p className={tw`mh-3 pb-3 text-[15px] ${isTyping && !typingStart ? 'prepare_stream' : ''}`}
                            >{
                                    typingStart ? <MarkdownComponent markdownText={replaceCiteNumbersWithCount(answerText)} /> : ''
                                }

                            </p>
                    }
                </div>
                {
                    timeList.length > 0 ?
                        <div className={tw`border-gray-200 border-t-solid border-t` + ` tag-box`}>

                            <span className={tw`font-bold text-[12px] mr-2 mt-2`}>了解详细信息:</span>
                            {/* <span className={tw`mt-2` + ` time-tag`}>1. 路飞给人带来了快乐 </span>
                        <span className={tw`mt-2` + ` time-tag`}>2. 路飞有惊人的力量 </span>
                        
                        <span className={tw`mt-2` + ` time-tag`}>3. 路飞成长了 </span>
                        <span className={tw`mt-2` + ` time-tag`}>+2 更多 </span> */}
                            {

                                timeList.map((item, index) => (
                                    index < 2 || showAll ?
                                        <Tooltip title={renderTip(findLetter(item))} placement='bottom'>
                                            <span className={tw`mt-2` + ` time-tag`} onClick={() => handleClickTime(item)}>{index + 1}. {letterList[findLetter(item)]?.content} </span>
                                        </Tooltip> : ''
                                ))
                            }{

                                timeList?.length > 2 ?
                                    showAll ? (
                                        <span className={tw`mt-2` + ` time-tag`} onClick={() => setShowAll(false)}>收起</span>
                                    ) :
                                        (
                                            <span className={tw`mt-2` + ` time-tag`} onClick={() => setShowAll(true)}>+{timeList?.length - 2}更多</span>
                                        ) : ''

                            }
                        </div> : ''
                }

            </div>
        </div>
    )
}
