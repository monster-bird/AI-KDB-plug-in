import logo from '@src/assets/img/logo.jpg';
import { runtimeSendMessage } from '@src/pages/common/helpers';
import { tw } from 'twind';

import stylus from './mini_button.module.css'
export default MiniButton;

function MiniButton(): JSX.Element {
  return (
    <>
      <svg t="1687876510592" class="video-complaint-icon video-toolbar-item-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5833" width="24" height="24"><path d="M372.925389 1023.979751a40.038309 40.038309 0 0 1-35.033521-59.056506s14.013408-26.024901 26.024901-56.053633 14.013408-41.039267 17.016282-52.049801h-7.006705c-21.020112 4.003831-45.043098 9.00862-72.068956 9.008619s-66.06321-7.006704-102.097687-30.028731-53.050759-62.059379-66.06321-128.122589c-9.00862-43.041182-12.011493-88.08428-12.011493-115.110138-2.001915-2.001915-6.005746-6.005746-16.015323-11.010535s-25.023943-13.01245-38.036394-19.018197l-34.032562-16.015323c-8.007662-5.004789-31.029689-18.017239-33.031605-46.044056s18.017239-44.04214 52.049801-77.073744c17.016281-16.015324 36.034478-34.032563 50.047887-51.048844s19.018197-31.029689 19.018196-32.030647c-1.000958-37.035436 7.006704-76.072787 22.02107-115.110138a344.329457 344.329457 0 0 1 73.069914-113.108223C267.824828 61.058421 359.912938 0 513.05947 0c108.103434 0 201.192502 54.051717 266.254754 158.15132 48.045971 75.071829 64.061294 149.142701 65.062252 152.145574a40.038309 40.038309 0 0 1-78.074702 17.016281c0-1.000958-15.014366-66.06321-56.053633-129.123546-50.047886-78.074702-117.112054-118.113011-197.188671-118.113011-99.094815 0-181.173348 31.029689-237.22698 89.085237s-73.069914 125.119715-72.068956 170.162813-49.046928 100.095772-94.090026 143.136954l-9.00862 9.00862h1.000958c19.018197 8.007662 39.037351 18.017239 57.05459 30.028732 28.026816 19.018197 43.041182 42.040224 43.041182 68.065125s2.001915 62.059379 11.010535 104.099603c13.01245 63.060337 29.027774 75.071829 31.029689 76.072787 39.037351 25.023943 76.072787 17.016281 115.110139 9.008619l30.028731-5.004788c26.024901-4.003831 48.045971 5.004789 62.059379 24.022985s16.015324 67.064167-8.007662 131.125462a756.724039 756.724039 0 0 1-33.031605 73.069914 40.038309 40.038309 0 0 1-37.035435 22.02107z" fill="currentColor" p-id="5834"></path><path d="M983.5096 538.515255H821.354449a40.038309 40.038309 0 0 1-28.026817-12.011493L654.194509 388.371597H463.011584a40.038309 40.038309 0 0 1 0-80.076618h208.199206a40.038309 40.038309 0 0 1 28.026816 12.011492l139.133124 138.132166h145.13887a40.038309 40.038309 0 0 1 0 80.076618zM685.224198 768.735531H509.055639a40.038309 40.038309 0 0 1 0-80.076618h159.152278l83.079491-83.079491a40.038309 40.038309 0 0 1 28.026816-12.011492h148.141743a40.038309 40.038309 0 0 1 0 80.076618H797.331463l-83.079491 83.079491a40.038309 40.038309 0 0 1-29.027774 12.011492zM597.139919 580.555479H402.95412a40.038309 40.038309 0 0 1 0-80.076618h194.185799a40.038309 40.038309 0 0 1 0 80.076618z" fill="currentColor" p-id="5835"></path></svg>
    <span data-v-8809ca1e="" class="video-complaint-info video-toolbar-item-text">AI笔记</span>
    </>
  );
  function checkUpdate() {
    runtimeSendMessage({
      action: 'checkUpdate',
      data: null
    });
  }
}
