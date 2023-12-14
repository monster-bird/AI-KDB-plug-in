import { tw } from "twind";
import { fleshTimeFormatter } from "../helpers";
import { useUserStore } from "./../../../../common/stores/user";
import { Alert, AlertProps, Button } from "antd";
import { css } from "twind/css";
import { BASE_URL } from "@src/pages/common/constants";
import { CloseIcon, WarnIcon } from "./Header/icons";
import { useGlobalStore } from "../stores/global";

export default Upgrade;

function Upgrade(): JSX.Element {
    const { info } = useUserStore();
    const props: AlertProps = {
        banner: true,
        className: tw`w-full`
    };

    const handleJumpToInvite = () => {
        window.open(BASE_URL + '/dashboard?tab=3')
    };
    const handleJumpToPay = () => {
        window.open(BASE_URL + '/pricing')
    }
    const handleClose = () => {
        useGlobalStore.getState().setActivedBody('none')
    }
    return (
        <div className={tw`bg-[#fffbe6] flex items-center leading-relaxed justify-between px-[12px] py-[8px]`}>
            
            <div className={tw` flex items-center text-[14px]`}>
                <WarnIcon className={tw`text-[#faad14] `}></WarnIcon>
                <span className={tw`ml-[8px] ` + ` noti-font-family`}>太慢了？升级课代表！</span>
            </div>
            <div className={tw`flex items-center gap-[2px]`}>
            <div className={tw`flex items-center justify-center gap-[2px] `}>
                <Button
                    type="primary"
                    className={tw`w-[60px] p-[2px] h-[23px] rounded-[36px] text-[10px] border-r`}
                    onClick={handleJumpToInvite}
                >

                    推广升级

                </Button>
                <Button
                    type="default"
                    className={tw`w-[60px] p-[2px] h-[23px] rounded-[36px] text-[10px]`}

                    onClick={handleJumpToPay}
                >

                    付费升级

                </Button>
            </div>
            <CloseIcon  className={tw`cursor-pointer` + ` close-icon`} onClick={handleClose}></CloseIcon>

            </div>


        </div>
    );
}
