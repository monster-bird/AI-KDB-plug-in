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
import { CheckOutlined } from '@ant-design/icons';


export default Question;

function Question(): JSX.Element {
    const [isTyping, setIsTyping] = useState(false)
    const summary = useSummaryStore();
    const { letterList, getLetterData } = useGlobalStore()
    const { info, setCredit } = useUserStore()
    const [queryString, setQueryString] = useState('')
    const [answerText, setAnswerText] = useState('')
    const [timeList, setTimeList] = useState([])
    const [showAll, setShowAll] = useState(false)
    const [isCopyed, setIsCopyed] = useState(false)
    const [showInput, setShowInput] = useState(true)
    const [beAnswering, setBeAnswering] = useState(false)
    const iconStyle = tw`text-[19px] cursor-pointer ml-[12px] hover:(text-[#333]! opacity-80)`;

    const _iconStyle = tw(iconStyle, `text-[18px] ml-0 mr-[8px] cursor-pointer`);

    useEffect(() => {
        if (letterList.length === 0) {
            getLetterData()

        }
    }, [])
    const onChange = (e) => {
        setQueryString(e.target.value)
    }
    const handleSubmit = () => {
        if (queryString === '') return
        setTimeList([])

        setAnswerText('')
        setIsTyping(true)
        setBeAnswering(true)
        fetchData()
    }
    const handleClickTime = (_time: number) => {
        window.postMessage({
            type: 'change-video-playback-time',
            data: _time
        });
        useGlobalStore.getState().setActivedBody('letter')
        event.stopPropagation();


    }
    const fetchData = async () => {
        const data = { q: queryString };


        try {
            const resp = await fetch(`${API_BASE_URL}/v2/ai-notes/${summary.currentBvid}${getP()}/qa`, {
                method: 'post',
                body: JSON.stringify(data),

                headers: {
                    'Authorization': `Bearer ${useUserStore.getState().token}`,
                    'Content-Type': 'application/json'
                },

            })
            const reader = resp.body.getReader();
            const textDecoder = new TextDecoder()
            while (1) {
                const { done, value } = await reader.read()
                if (done) {
                    setIsTyping(false)
                    setBeAnswering(false)
                    break;
                }

                const str = textDecoder.decode(value)
                const _list = str.split('\n\n')
                _list.forEach(value => {
                    const _lineList = value.split('\n')
                    console.log(_lineList[0]);

                    if (_lineList[0].includes('personal')) {
                        const _objList = _lineList[1].split('data: ')
                        if (_objList.length > 1) {

                            let obj = JSON.parse(_objList[1])

                            const credit = {
                                remainingCredit: obj.body.remainingCredit,
                                totalCredit: obj.body.totalCredit,
                                creditResetTime: obj.body.creditResetTime,
                            }
                            console.log(credit);

                            setCredit(credit);
                        }
                    }
                    if (_lineList[0].includes('answer')) {
                        const _objList = _lineList[1].split('data: ')
                        if (_objList.length > 1) {

                            let obj = JSON.parse(_objList[1])
                            setAnswerText(value => {
                                let originText = value + obj.body
                                return originText

                                // if (match) {
                                //     var text = match[1];
                                //     let replacedStr = originText.replace(regex, `_${match[1]}_`);
                                //     return replacedStr
                                // } else {
                                //     console.log("未找到匹配的文本");
                                //     return originText

                                // }
                            })

                        }
                    }
                })

            }
        } catch (error) {

        }
    }
    const handleCopy = () => {
        setIsCopyed(true)
        navigator.clipboard.write([
            new ClipboardItem({
                'text/plain': new Blob([answerText], {
                    type: 'text/plain'
                })
            })
        ]);
        setTimeout(() => {
            setIsCopyed(false)

        }, 2000)
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
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            // 在这里调用你想要触发的函数
            event.preventDefault();
            handleSubmit()
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
            console.log('超过下标');

        }

        return leftStr + '，' + letterList[index].content + '，' + rightStr

    }
    // console.log(answerText);
    // const pattern = /(\$CITE_{(.*?)}\$)/;

    // const splitText = answerText.split(pattern);
    // console.log(splitText);
    // let content = splitText.filter(str => str.match(pattern));
    // var result = content.concat(citations);
    // console.log(splitText);

    if (letterList.length === 0) {
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
    const pattern = /(\$CITE_{.*?}\$)/;

    const result = answerText.split(pattern).filter(Boolean);

    // result.map((item, index)=>{
    //     if (item.match(/\$CITE_{(.+?)}\$/) ) {
    //         let _time = item
    //          pattern.exec(_time)
    //          console.log(_time);

    //     }
    // })
    const timePattern = /\$CITE_{(.*?)}\$/;
    result.forEach(value => {
        if (value.match(timePattern)) {
            const match = value.match(timePattern);

            if (!match) return
            if (!timeList.some(item => item?.time === match[1])) {
                setTimeList(prevArray => [
                    ...prevArray, {
                        time: match[1],
                        key: findLetter(match[1])
                    }
                ])

            }

        }

    })
    // 合并content和citations到一个数组
    let count = 1

    return (
        <div className={tw``}>
            <div className={tw`box-border pl-[10px] pr-[10px] pb-[10px] border-b `}>
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
                        <Button type='primary' block loading={beAnswering} disabled={info?.remainingCredit <= 0} onClick={handleSubmit}>{beAnswering ? '回答中...' : info?.remainingCredit > 0 ? '提交（Enter）' : '余额不足'}</Button>

                    </div>) : ''
                }

            </div>
            <div className={tw`border-gray-200 border-t-solid border-t  pt-[10px] pl-[10px] pr-[10px]`}>
                {
                    answerText ?
                        <div className={tw`flex justify-between`}>
                            <div>{
                                isCopyed ?
                                    <CheckOutlined className={_iconStyle} rev={undefined} /> :
                                    <Tooltip title="复制答案">
                                        <CopyIcon onClick={handleCopy} className={_iconStyle} />
                                    </Tooltip>
                            }
                            </div>
                            <div></div>

                        </div> : ''
                }

                <div className={tw`mt-2  `}>
                    <p className={tw`mh-3 text-[15px] ` + `${isTyping ? '     cursor-after' : ''}`}
                    >{result.map((part, index) => (
                        part.match(/\$CITE_{(.+?)}\$/) ? (part !== ' ' ? (
                            <span key={index} className={`text-tag`} onClick={() => handleClickTime(part)}>{count++}</span>

                        ) : '') : (
                            <span key={index}>{part}</span>
                        )
                    ))}</p>

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
                                        <Tooltip title={renderTip(item.key)} placement='bottom'>
                                            <span className={tw`mt-2` + ` time-tag`} onClick={() => handleClickTime(item.time)}>{index + 1}. {letterList[item.key]?.content} </span>
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
