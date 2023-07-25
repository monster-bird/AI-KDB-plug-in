import img from '@assets/img/prop_img.jpg';
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
    <div className={tw`w-[350px]`}>
      <img className={tw`w-50 h-auto`} src={img}/>
    </div>
  );
}
