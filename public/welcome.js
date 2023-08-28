window.addEventListener(
  "message",
  function (event) {
    // 检查发送消息的源是否可靠

    // popup.js（前端代码）
    // let objData = JSON.parse(event.data)
    let objData = JSON.parse(event.data);

    if (objData.type !== "login-success") {
      return;
    }
    console.log(objData);

    chrome.runtime.sendMessage(
      {
        action: "login-success",
        data: { key: 'token0609', value: objData.payload.token },
      },
      function (response) {
        console.log("返回了" + response); // 打印从后台接收到的响应
      }
    );
  },
  false
);
