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
        <div className={tw`bg-[#fffbe6] flex pt-1 pl-1 pr-1 pb-1 gap-[3px]`}>
            
            <div className={tw`mt-1 pl-2 text-[15px] `}>
                <WarnIcon className={tw`text-[#faad14] mr-[1px]`}></WarnIcon>
                <span>太慢了？升级课代表开启“高速通道”</span>
            </div>
            <div className={tw`flex items-center justify-center gap-3 mt-2 mb-2`}>
                <Button
                    type="primary"
                    shape="round"
                    onClick={handleJumpToInvite}
                >

                    推广升级

                </Button>
                <Button
                    type="default"
                    shape="round"
                    onClick={handleJumpToPay}
                >

                    付费升级

                </Button>
            </div>
            <CloseIcon  className={tw`cursor-pointer `} onClick={handleClose}></CloseIcon>


        </div>
    );
}
