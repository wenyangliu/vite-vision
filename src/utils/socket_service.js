// 单例模式
export default class SocketService {
  static instance = null
  static get Instance() {
    if (!this.instance) {
      this.instance = new SocketService()
    }
    return this.instance
  }

  // 和服务端连接的socket对象
  ws = null

  // 存储回调函数
  callBackMapping = {}

  // 标识是否连接成功
  connected = false

  // 记录重试的次数
  sendRetryCount = 0

  // 重新连接尝试的次数
  connectRetryCount = 0

  // 连接服务器方法
  connect() {
    if (!window.WebSocket) {
      return console.log('您的浏览器不支持WebSocket')
    }
    this.ws = new WebSocket('ws://39.106.81.114:9998')

    this.ws.onopen = () => {
      console.log('连接服务端成功了')
      this.connected = true
      this.connectRetryCount = 0
    }
    this.ws.onclose = () => {
      console.log('连接服务端失败')
      this.connected = false
      this.connectRetryCount++
      setTimeout(() => {
        this.connect()
      }, 500 * this.connectRetryCount)
    }
    this.ws.onmessage = msg => {
      console.log('从服务端获取到数据')

      const recvData = JSON.parse(msg.data)
      const socketType = recvData.socketType
      if (this.callBackMapping[socketType]) {
        // const action = recvData.action
        this.callBackMapping[socketType].call(this, recvData)
      }
    }
  }

  // 回调函数的注册
  registerCallBack(socketType, callBack) {
    this.callBackMapping[socketType] = callBack
  }

  // 取消某一个回调函数
  unRegisterCallBack(socketType) {
    this.callBackMapping[socketType] = null
  }

  // 发送数据
  send(data) {
    if (this.connected) {
      this.sendRetryCount = 0
      this.ws.send(JSON.stringify(data))
    } else {
      this.sendRetryCount++
      setTimeout(() => {
        this.send(data)
      }, this.sendRetryCount * 500)
    }
  }

}