import logo from '@assets/img/logo.jpg';
import { useMount } from 'ahooks';
import { tw } from 'twind';

import { useOAuthStore } from '../common/stores/o-auth';
import { useUserStore } from '../common/stores/user';

export default Popup;

function Popup(): JSX.Element {
  const userStore = useUserStore();
  const { start: startOAuthLogin } = useOAuthStore();
  const hasLogin = !!userStore.token;

  useMount(userStore.init);

  return (
    <div className={tw`w-[200px] h-[300px]`}>
      <img src={logo} alt="logo" />
      {hasLogin ? (
        <div>{userStore.info?.userName}</div>
      ) : (
        <div onClick={startOAuthLogin}>未登录，点击登录</div>
      )}
    </div>
  );
}
