import { tw } from "twind";

export default NoMoney;

function NoMoney(): JSX.Element {
  return (
    <>
      <div
        className={
          tw`w-full h-[44px] flex justify-between items-center px-[10px] box-border ` +
          ` m-header`
        }
      >
        <span>你的免费使用期已用完，立即升级以继续使用笔记要功能</span>
      </div>
    </>
  );
}
