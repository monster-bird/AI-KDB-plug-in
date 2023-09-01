import { tw } from "twind";
import { fleshTimeFormatter } from "../helpers";
import { useUserStore } from "./../../../../common/stores/user";
import { Button } from "antd";
import { css } from "twind/css";
import { BASE_URL } from "@src/pages/common/constants";

export default NoMoney;

function NoMoney(): JSX.Element {
  const { info } = useUserStore();
  const handleJumpToInvite = () => {


    if (info?.userType === 1) {
      window.open(BASE_URL+"/dashboard?tab=1");
    } else window.open(BASE_URL + "/dashboard?tab=3");
  };
  return (
    <>
      <div
        className={
          tw`w-full h-[100px] flex flex-col justify-center gap-4 items-center px-[10px] py-[10px] box-border ` +
          ` m-header`
        }
      >
        <div className={tw`text-[15px] w-full`}>
          每日额度已用尽，{fleshTimeFormatter(info.creditResetTime)}后刷新。
        </div>
        {info?.userType <= 1 ? (
          <Button
            type="primary"
            block
            shape="round"
            onClick={handleJumpToInvite}
          >
            {info?.userType === 0
              ? "免费升级"
              : info?.userType === 1
              ? "立即升级"
              : ""}
          </Button>
        ) : (
          <>
            <div className={tw`text-[20px] font-bold`}>下次再见👋</div>
          </>
          
        )}
      </div>
    </>
  );
}
