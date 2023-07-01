import type { AlertProps } from 'antd';
import { Alert } from 'antd';
import { tw } from 'twind';

import { useNotificationStore } from '../stores/notification';

export default Notification;

function Notification(): JSX.Element {
  const { componentProps, visible } = useNotificationStore();

  const props: AlertProps = {
    banner: true,
    className: tw`w-full`,
    closable: true,
    ...componentProps
  };

  return visible ? <Alert {...props} /> : <></>;
}
