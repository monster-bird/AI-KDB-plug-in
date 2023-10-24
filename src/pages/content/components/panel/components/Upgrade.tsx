import { tw } from "twind";
import { fleshTimeFormatter } from "../helpers";
import { useUserStore } from "./../../../../common/stores/user";
import { Alert, AlertProps, Button } from "antd";
import { css } from "twind/css";
import { BASE_URL } from "@src/pages/common/constants";

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
    return (
        <>

            <div className={tw`mt-1 pl-2 text-[15px]`}>太慢了？升级课代表开启“高速通道”</div>
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


        </>
    );
}
