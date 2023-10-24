import React, { useEffect, useState } from "react";
import { useSummaryStore } from "../stores/summary";
import { axiosInstance } from "@src/pages/common/libs/axios";
import { apply, tw } from "twind";
import { Skeleton, Tabs, Tag, Input, Checkbox, Button, Tooltip } from "antd";
import { useGlobalStore } from "../stores/global";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  CloseOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { MatchCaseIcon } from "./Header/icons";
import { API_BASE_URL, BASE_URL } from "@src/pages/common/constants";
import { getP } from "../helpers";
import { useUserStore } from "@src/pages/common/stores/user";

import { read } from "fs";
function secondToTimeStr(s: number): string {
  const m = Math.floor(s / 60);
  const s2 = parseInt(String(s % 60));
  const left = String(m).length === 1 ? `0${m}` : m;
  const right = String(s2).length === 1 ? `0${s2}` : s2;
  return `${left}:${right}`;
}
function useDebounce(fn: (...args: any[]) => void, delay: number) {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  return (...args: any[]) => {
    if (timer) {
      clearTimeout(timer);
    }
    setTimer(
      setTimeout(() => {
        fn(...args);
      }, delay)
    );
  };
}
export default function LetterList() {
  const summary = useSummaryStore();
  const global = useGlobalStore();
  const {
    letterLoading,
    setLetterLoading,
    letterList,
    getStreamLetterData,
    setLetterList,
    transList,
    setTransStart,
    getLangLetterList,
    originList,
    setOriginList,
    transStart,
    setTransLoading,
    transLoading
  } = useGlobalStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isTrans, setIsTrans] = useState(false);

  const [keyList, setKeyList] = useState([]);
  const [nowSelectKey, setNowSelectKey] = useState("");
  const [noLetterNotification, setNoLetterNotification] =
    useState("");
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(-1);
  const [startY, setStartY] = useState(-1);
  const [autoMode, setAutoMode] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const { info } = useUserStore()
  const [lastScrollTop, setLastScrollTop] = useState(0);
  let flag = false;
  const step = 5; // 步长
  useEffect(() => {
    setLetterLoading(true)
    setAutoMode(false);
    if (global.letterList.length === 0)
      setTimeout(() => {
        getStreamLetterData();
      }, 300);
    else {
      setTimeout(() => {
        setOriginList([...global.letterList]);
        setLetterList([...global.letterList]);

        setSearchTerm(global.searchWords);
        setLetterLoading(false);
        findSelectKeyList(global.searchWords, global.letterList);
        setNowSelectKey(global.currentSelectKey);
        refleshTime(global.currentTime);
      }, 300);
    }
  }, []);
  useEffect(() => {
    if (letterList?.length === 0) return;
    setOriginList([...letterList])
    if (is80PercentEnglishContent(letterList)) {
      setIsTrans(true);
    } else {
    }
  }, [letterList]);

  useEffect(() => {
    if (originList.length > 0) {
      refleshTime(global.currentTime);
    }
  }, [global.currentTime, originList]);
  const refleshTime = (_currentTime: number) => {
    let maxIndex = -1;
    originList.map((item, index) => {
      if (Math.floor(item.from) <= _currentTime) {
        maxIndex = index;
      }
    });

    setCurrentIndex(maxIndex);
  };
  const handleShowOrigin = () => {
    setTransStart(false);

  }
  function is80PercentEnglishContent(subtitles: any): boolean {
    const englishContents = subtitles.filter((sub: any) =>
      isEnglishContent(sub.content)
    );
    return englishContents.length / subtitles.length >= 0.7;
  }
  function isEnglishContent(s: string): boolean {
    let englishCharCount = 0;
    for (let i = 0; i < s.length; i++) {
      const charCode = s.charCodeAt(i);
      if (
        (charCode >= 65 && charCode <= 90) ||
        (charCode >= 97 && charCode <= 122)
      ) {
        englishCharCount++;
      }
    }
    const percentage = (englishCharCount / s.length) * 100;
    return percentage >= 60;
  }
  const handleTrans = () => {
    setTransStart(true);
    getLangLetterList("ZH");
  };

  const findSelectKeyList = (value, letterList) => {
    setKeyList([]);
    if (letterList.length === 0) return


    let tempList = [];
    let escapedValue = value.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    let pattern: any;
    if (global.caseMode) {
      pattern = new RegExp(`(${escapedValue})`, "g");
    } else {
      pattern = new RegExp(`(${escapedValue})`, "gi");
    }
    letterList.map((item, i) => {
      let contentList: string[] = [];

      (typeof item === 'object') ? contentList = item.content.split(pattern)
        : contentList = item.split(pattern)

      contentList.map((_, j) => {
        if (pattern.test(_)) tempList.push(i + "-" + j);
      });
    });

    setKeyList(tempList);

    setNowSelectKey(tempList[0]);
    global.setcurrentSelectKey(tempList[0]);
  };
  const handleInputChange = (event: { target: { value: any } }) => {
    const value = event.target.value;
    setSearchTerm(value);
    global.setSearchWords(value);
    // 调用防抖函数
    // setLetterList(searchArray([...originList], value))
    if (value === "" || !value) {
      setKeyList([]);

      return;
    }

    global.setRealMode(false);
    if (transStart && !containsNoChinese(value)) {
      console.log('开始中文查找');

      findSelectKeyList(value, transList);

    } else {
      findSelectKeyList(value, letterList);

    }
  };

  // const searchArray = (array, searchTerm) => {
  //   return array.filter((item) => {
  //     const regex = new RegExp(searchTerm, "gi");
  //     return item.content.match(regex);
  //   }).map((item) => {
  //     const regex = new RegExp(searchTerm, "gi");
  //     return { ...item, content: item.content.replace(regex, `<em style="color: #ffa502;">${searchTerm}</em>`) };

  //   })

  // };
  const onCheckBoxChange = (e) => {
    if (e.target.checked) {
      setAutoMode(false);
    }
    global.setRealMode(e.target.checked);
  };
  const onShowTransChange = (e) => {
    if (e.target.checked) {
      setTransLoading(true)

      handleTrans()

    } else {
      setTransStart(false);
      setTransLoading(false)
    }
  }
  const scrollRef = React.useRef(null);
  useEffect(() => {
    // 滚动到当前歌词行
    if (scrollRef.current && global.realMode) {
      const scrollContainer = scrollRef.current;
      const currentLine = scrollContainer.querySelector(".highlight");

      if (!currentLine) return;
      if (global.mode !== "list") {
      }
      const offset = currentLine.offsetTop;

      if (currentIndex > 6) {
        scrollContainer.scrollTo({
          top: offset - 150,
          behavior: "smooth",
        });
        setTimeout(() => {
          setAutoMode(true);
        }, 1000);
      }
    }
  }, [currentIndex, global.realMode]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current;
      const currentLine = scrollContainer.querySelector(".selectKey");
      if (!currentLine) return;

      const offset = currentLine.offsetTop;

      global.devLog(nowSelectKey);
      scrollContainer.scrollTo({
        top: offset - 150,
        behavior: "smooth",
      });
      setTimeout(() => {
        setAutoMode(true);
      }, 1000);
    }
  }, [nowSelectKey]);

  const handleScroll = useDebounce((event: React.UIEvent) => {
    const scrollTop = event.target.scrollTop;
    const scrollDifference = scrollTop - lastScrollTop;

    if (scrollDifference > 70) {
      if (autoMode) {
        global.setRealMode(false);
      }
    }
    setLastScrollTop(scrollTop);
  }, 100);
  const handleKeyUp = () => {
    global.setRealMode(false);
    let index = keyList.findIndex((value) => value === nowSelectKey);
    setAutoMode(true);

    if (index === -1) {
      return;
    }
    if (index === 0) {
      index = keyList.length - 1;
    } else {
      index -= 1;
    }

    setNowSelectKey(keyList[index]);
    global.setcurrentSelectKey(keyList[index]);
  };
  const handleKeyDown = () => {
    global.setRealMode(false);
    setAutoMode(true);

    let index = keyList.findIndex((value) => value === nowSelectKey);

    if (index === -1) {
      return;
    }
    index = (index + 1) % keyList.length;

    setNowSelectKey(keyList[index]);
    global.setcurrentSelectKey(keyList[index]);
  };
  const handleDeleteKey = () => {
    setSearchTerm("");
    global.setSearchWords("");
  };

  const renderLineRegs = (content, _index) => {
    if (!searchTerm) {
      return content; // 当 searchTerm 为空时，直接返回 false
    }

    // const mapValue = content.replace(new RegExp(searchTerm, "gi"), '*%#');
    let escapedValue = searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    let pattern: any;
    if (global.caseMode) {
      pattern = new RegExp(`(${escapedValue})`, "g");
    } else {
      pattern = new RegExp(`(${escapedValue})`, "gi");
    }
    const contentList = content.split(pattern);

    if (contentList.length >= 0) {
      return (
        <>
          {contentList.map((item, index) => {
            return (
              <>
                {pattern.test(item) ? (
                  <span
                    className={
                      `${nowSelectKey === _index + "-" + index
                        ? "selectKey "
                        : " "
                      }` +
                      tw`${nowSelectKey === _index + "-" + index
                        ? " bg-[#fb9434] "
                        : " bg-[#fcfa04]"
                        }`
                    }
                  >
                    {item}
                  </span>
                ) : (
                  <span>{item}</span>
                )}
              </>
            );
          })}
        </>
      );
    } else {
      return <span>{content}</span>;
    }
  };
  const renderList = () => {
    return (
      <>
        <div className={tw`mt-2 `}>
          <div className={tw`flex pl-3 pr-3`}>
            <span className={tw`w-[48px]`}>时间</span>
            <span >字幕</span>
          </div>
          <div
            className={tw`h-[350px] overflow-y-scroll relative`}
            onScroll={handleScroll}
            ref={scrollRef}
          >
            {letterList.map((item, index) => (
              <div
                key={index + item.from}
                className={tw`flex items-start pb-[4px] pt-[4px] pl-[12px] pr-[12px] mletter-list cursor-pointer   hover:bg-gray-200 
              ${index === currentIndex ? "text-red-400 highlight" : ""}`}
                onClick={(e) => handleClick(e, item)}
                onMouseMove={handleMouseMove}
                onMouseDown={(e) => handleMouseDown(e, item)}
              >
                <div className={tw`w-[48px]  relative flex text-[13px]` + `dm-info-time`}>
                  {currentIndex === index ? (
                    <span className={tw`-ml-3 absolute`}>•</span>
                  ) : (
                    ""
                  )}

                  {secondToTimeStr(item.from)}
                </div>

                <div className={tw`dm-info-dm w-4/5 `}>
                  {renderLineRegs(item.content, index)}
                  {transStart ? <div>{renderLineRegs(transList[index], index)}</div> : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };
  const renderNoLetter = () => {
    return (
      <div className={tw`mt-2 `}>
        <div className={tw`flex pl-[12px] pr-[12px]`}>
          <span className={tw`w-[48px]`}>时间</span>
          <span>字幕</span>
        </div>
        <div className={tw`h-[80px] overflow-y-scroll relative`}>
          <div
            className={tw`flex items-center pb-[4px] pt-[4px] pl-[12px] pr-[12px] cursor-pointer   hover:bg-gray-200 `}
          >
            <div className={tw`w-[48px] relative ` + `dm-info-time`}>0:00</div>

            <div className={tw`dm-info-dm w-4/5`}>
              <span>{noLetterNotification}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  function containsNoChinese(str) {
    return !/[\u4e00-\u9fa5]/.test(str);
  }

  // 测试
  // console.log(containsNoChinese("hello"));  // 输出：true（不含有中文）
  // console.log(containsNoChinese("你好"));  // 输出：false（含有中文）
  // console.log(containsNoChinese("hello你好"));  // 输出：false（含有中文）
  // console.log(containsNoChinese("hello world!"));  // 输出：true（不含有中文）

  const renderArticle = (isTrans: boolean) => {
    let count = 0;
    return (
      <div
        className={tw` h-[350px] overflow-y-scroll relative`}
        onScroll={handleScroll}
        ref={scrollRef}
      >
        {letterList.map((item, index) => {
          if (count >= 2) count = 0;
          return (
            <span
              className={tw`${index === currentIndex ? " text-red-500 highlight" : ""
                }`}
            >
              <span
                className={tw`cursor-pointer hover:underline` + ` dm-info-dm`}
                onClick={(e) => handleClick(e, item)}
                onMouseMove={handleMouseMove}
                onMouseDown={(e) => handleMouseDown(e, item)}
              >
                {

                  renderLineRegs(item.content, index)
                }
              </span>
              {item?.content?.slice(-1) === "," ||
                item?.content?.slice(-1) === "." ||
                item?.content?.slice(-1) === ":" ||
                item?.content?.slice(-1) === "!" ||
                item?.content?.slice(-1) === "?" ||
                containsNoChinese(item?.content) ? (
                ""
              ) : (
                <span>{++count >= 2 ? "。" : "，"}</span>
              )}
            </span>
          );
        })}
      </div>
    );
  };
  function handleMouseDown(event, index) {
    // 记录鼠标初始位置

    event.stopPropagation();
    setIsDragging(false);
    setStartX(event.clientX);
    setStartY(event.clientY);
  }

  const handleClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDragging) {
      setIsDragging(false);
      return;
    }
    if (typeof item.from === "number") {
      window.postMessage({
        type: "change-video-playback-time",
        data: Math.floor(item.from),
      });
      refleshTime(Math.floor(item.from));
    }

    e.stopPropagation();
  };
  function handleMouseMove(event) {
    // 判断是否超过最小拖动距离阈值
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      setIsDragging(true);
      setStartX(deltaX);
      setStartY(deltaY);
    }
  }
  function renderTransAriticle(list: any[], start: number, isTrans: boolean) {
    let count = 0;
    return (
      <div


      >
        {list.map((item, index) => {
          if (count >= 2) count = 0;
          return (
            <span
              className={tw`${index + start === currentIndex ? " text-red-500 highlight" : ""
                }`}
            >
              <span
                className={tw`cursor-pointer hover:underline` + `dm-info-dm`}
                onClick={(e) => handleClick(e, item)}
                onMouseMove={handleMouseMove}
                onMouseDown={(e) => handleMouseDown(e, item)}
              >
                {
                  isTrans ?
                    renderLineRegs(transList[index + start], index + start) :
                    renderLineRegs(item.content, index + start)
                }
              </span>
              {item?.content?.slice(-1) === "," ||
                item?.content?.slice(-1) === "." ||
                item?.content?.slice(-1) === ":" ||
                item?.content?.slice(-1) === "!" ||
                item?.content?.slice(-1) === "?" ||
                containsNoChinese(item?.content) ? (
                ""
              ) : (
                <span>{++count >= 2 ? "。" : "，"}</span>
              )}
            </span>
          );
        })}
      </div>
    );
  }
  return (
    <div className={tw`pl-[12px] pr-[12px]`}>
      <div className={tw`flex justify-between items-center `}>
        <div className={tw`relative w-full`}>

          {
            info.userType >= 1 ? (
              <Input
                className={tw`w-full`}
                placeholder="搜索字幕"
                onChange={handleInputChange}
                value={searchTerm}
              />
            ) :
              (
                <Tooltip title="升级你的课代表解锁该功能">
                  <Input
                    className={tw`w-full cursor-pointer`}
                    placeholder="搜索字幕"
                    value=''

                    onClick={() => {
                      window.open(BASE_URL + '/pricing')
                    }}
                  />
                </Tooltip>
              )
          }
          <span className={tw`absolute top-0 right-2 flex h-full items-center`}>
            <span>
              {searchTerm !== "" ? (
                <span>
                  {keyList.findIndex((value) => value === nowSelectKey) + 1}/
                  {keyList.length}
                </span>
              ) : (
                ""
              )}
            </span>
            <Tooltip title="匹配大小写">
              <MatchCaseIcon
                onClick={() => global.setCaseMode(!global.caseMode)}
                className={tw`ml-1 cursor-pointer p-1 w-4 border-box h-[16px]
          rounded-sm ${global.caseMode ? "bg-gray-200 " : "hover:bg-gray-100"}`}
              />
            </Tooltip>
          </span>
        </div>
        <div className={tw`flex justify-center items-center ml-2`}>
          <span className={tw`ml-2`}>
            <Button
              onClick={handleKeyUp}
              icon={<ArrowUpOutlined rev={undefined} />}
            ></Button>
          </span>
          <span className={tw`ml-2`}>
            <Button
              onClick={handleKeyDown}
              icon={<ArrowDownOutlined rev={undefined} />}
            ></Button>
          </span>
          <span className={tw`ml-2`}>
            <Button
              onClick={handleDeleteKey}
              icon={<CloseOutlined rev={undefined} />}
            ></Button>
          </span>
        </div>
      </div>

      <div className={tw`flex items-center justify-between h-[30px]`}>
        {letterList.length > 0 ? (
          <div className={tw`text-[13px]`}>
            <p>
              共{letterList.length + 1}条字幕
              {searchTerm !== "" ? <>，搜索到{keyList.length}条</> : ""}
            </p>
          </div>
        ) : (
          " "
        )}
        <div className={tw`flex gap-[10px] items-center`}>
          {isTrans ? transLoading ? (<div className={tw`gap-[5px] flex`}>
            <LoadingOutlined rev={undefined}></LoadingOutlined>
            正在翻译
          </div>) : (
            <div>
              {
                info.userType >= 2 ?
                  <Checkbox onChange={onShowTransChange} checked={transStart}>
                    双语字幕
                  </Checkbox> : (
                    <Tooltip title='升级你的课代表解锁该功能'>
                      <Checkbox checked={transStart} onClick={()=>{
                        window.open(BASE_URL+'/pricing')
                      }}>
                        双语字幕
                      </Checkbox>
                    </Tooltip>
                  )}
              {/* {
                transStart ?
                  <Button className={tw`flex mr-1 h-full`} onClick={handleShowOrigin}>显示原文</Button>

                  :
                  <Button className={tw`flex mr-1 h-full`} onClick={handleTrans}>翻译</Button>
              } */}

            </div>
          ) : (
            ""
          )}
          <Checkbox onChange={onCheckBoxChange} checked={global.realMode}>
            实时滚动
          </Checkbox>
        </div>

      </div>
      <div className="mlist-font">
        {!letterLoading ? (
          letterList.length > 0 ? (
            global.mode !== "list" ? (
              transStart ? (
                <div className={tw`h-[350px] overflow-y-scroll relative`}
                  onScroll={handleScroll}
                  ref={scrollRef}>
                  {
                    letterList.map((item, index) => {
                      if (index % 5 === 0)
                        return (
                          <div>
                            {/* <div className={tw`${index <= currentIndex && currentIndex <= index + 5 ? " text-red-500 highlight" : ""
                            }`}>{secondToTimeStr(letterList[index].from)}</div> */}
                            <div>
                              <br></br>
                            </div>
                            <div>
                              {

                                renderTransAriticle(letterList.slice(index, index + 5), index, false)
                              }
                            </div>
                            <div className={tw`mt-1`}>
                              {
                                renderTransAriticle(letterList.slice(index, index + 5), index, true)

                              }
                            </div>
                          </div>

                        )
                    })
                  }


                </div>)
                : renderArticle(false)

            ) : (
              renderList()
            )
          ) : (
            renderNoLetter()
          )
        ) : (
          <>
            <div className={tw`h-[350px] pl-[12px] pr-[12px] mt-[12px]`}>
              <Skeleton className={tw`mt-3`} active />
              <Skeleton className={tw`mt-3`} active />
              <Skeleton className={tw`mt-3`} active />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
