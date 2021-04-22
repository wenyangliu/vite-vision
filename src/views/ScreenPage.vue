<template>
  <div class="screen-container" :style="containerStyle">
    <header class="screen-header">
      <div>
        <img :src="headerSrc" alt="" />
      </div>
      <span class="logo">
        <img :src="logoSrc" alt="" />
      </span>
      <span class="title">电商平台实时监控系统</span>
      <div class="title-right">
        <img :src="themeSrc" class="qiehuan" @click="handleChangeTheme" />
        <span class="datetime">{{ nowTime }}</span>
      </div>
    </header>
    <div class="screen-body">
      <section class="screen-left">
        <div
          id="left-top"
          :class="[fullScreenStatus.trend ? 'fullscreen' : '']"
        >
          <!-- 销量趋势图表 -->
          <Trend ref="trendRef"></Trend>
          <div class="resize">
            <!-- icon-compress-alt -->
            <span
              @click="changeSize('trend')"
              :class="[
                'iconfont',
                fullScreenStatus.trend
                  ? 'icon-compress-alt'
                  : 'icon-expand-alt',
              ]"
            ></span>
          </div>
        </div>
        <div
          id="left-bottom"
          :class="[fullScreenStatus.seller ? 'fullscreen' : '']"
        >
          <!-- 商家销售金额图表 -->
          <Seller ref="sellerRef"></Seller>
          <div class="resize">
            <!-- icon-compress-alt -->
            <span
              @click="changeSize('seller')"
              :class="[
                'iconfont',
                fullScreenStatus.seller
                  ? 'icon-compress-alt'
                  : 'icon-expand-alt',
              ]"
            ></span>
          </div>
        </div>
      </section>
      <section class="screen-middle">
        <div
          id="middle-top"
          :class="[fullScreenStatus.map ? 'fullscreen' : '']"
        >
          <!-- 商家分布图表 -->
          <Map ref="mapRef"></Map>
          <div class="resize">
            <!-- icon-compress-alt -->
            <span
              @click="changeSize('map')"
              :class="[
                'iconfont',
                fullScreenStatus.map ? 'icon-compress-alt' : 'icon-expand-alt',
              ]"
            ></span>
          </div>
        </div>
        <div
          id="middle-bottom"
          :class="[fullScreenStatus.rank ? 'fullscreen' : '']"
        >
          <!-- 地区销量排行图表 -->
          <Rank ref="rankRef"></Rank>
          <div class="resize">
            <!-- icon-compress-alt -->
            <span
              @click="changeSize('rank')"
              :class="[
                'iconfont',
                fullScreenStatus.rank ? 'icon-compress-alt' : 'icon-expand-alt',
              ]"
            ></span>
          </div>
        </div>
      </section>
      <section class="screen-right">
        <div id="right-top" :class="[fullScreenStatus.hot ? 'fullscreen' : '']">
          <!-- 热销商品占比图表 -->
          <Hot ref="hotRef"></Hot>
          <div class="resize">
            <!-- icon-compress-alt -->
            <span
              @click="changeSize('hot')"
              :class="[
                'iconfont',
                fullScreenStatus.hot ? 'icon-compress-alt' : 'icon-expand-alt',
              ]"
            ></span>
          </div>
        </div>
        <div
          id="right-bottom"
          :class="[fullScreenStatus.stock ? 'fullscreen' : '']"
        >
          <!-- 库存销量分析图表 -->
          <Stock ref="stockRef"></Stock>
          <div class="resize">
            <!-- icon-compress-alt -->
            <span
              @click="changeSize('stock')"
              :class="[
                'iconfont',
                fullScreenStatus.stock
                  ? 'icon-compress-alt'
                  : 'icon-expand-alt',
              ]"
            ></span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onUnmounted, nextTick, inject } from 'vue'
import { getThemeValue } from '@/utils/theme_utils'
import { useStore } from 'vuex'
import Trend from '@/components/Trend.vue'
import Seller from '@/components/Seller.vue'
import Map from '@/components/Map.vue'
import Rank from '@/components/Rank.vue'
import Hot from '@/components/Hot.vue'
import Stock from '@/components/Stock.vue'
const store = useStore()
const socket = inject('$socket')

socket.registerCallBack('fullScreen', recvData)
socket.registerCallBack('themeChange', recvThemeChange)

ref: trendRef = null
ref: sellerRef = null
ref: mapRef = null
ref: rankRef = null
ref: hotRef = null
ref: stockRef = null
const fullScreenStatus = reactive({
  trend: false,
  seller: false,
  map: false,
  rank: false,
  hot: false,
  stock: false,
})
const theme = computed(() => store.state.theme)

// 注意这里得到的theme要用到theme.value

const headerSrc = computed(
  () => '/static/img/' + getThemeValue(theme.value).headerBorderSrc
)
const logoSrc = computed(
  () => '/static/img/' + getThemeValue(theme.value).logoSrc
)
const themeSrc = computed(
  () => '/static/img/' + getThemeValue(theme.value).themeSrc
)
const containerStyle = computed(() => {
  return {
    backgroundColor: getThemeValue(theme.value).backgroundColor,
    color: getThemeValue(theme.value).titleColor,
  }
})

let nowTime = ref(getNowTime())
const tId = setInterval(setNowTime, 1000)

// 清除定时器
onUnmounted(() => {
  clearInterval(tId)
  socket.unRegisterCallBack('fullScreen')
  socket.unRegisterCallBack('themeChange')
})

// 获取当前时间
function getNowTime() {
  const now = new Date()
  const y = now.getFullYear(),
    m = now.getMonth() + 1,
    d = now.getDate(),
    h = now.getHours(),
    min = now.getMinutes(),
    s = now.getSeconds()
  const time = `${y.toString()}-${formatDate(m)}-${formatDate(d)}  ${formatDate(
    h
  )}:${formatDate(min)}:${formatDate(s)}`
  return time
}

// 格式化时间
function formatDate(num) {
  if (num < 10) return 0 + num.toString()
  return num.toString()
}

// 设置当前时间
function setNowTime() {
  nowTime.value = getNowTime()
}

function handleChangeTheme() {
  // store.commit('changeTheme')

  // 使用socket
  socket.send({
    action: 'themeChange',
    socketType: 'themeChange',
    chartName: '',
    value: '',
  })
}
async function changeSize(chartName) {
  // const refMap = {
  //   trend: trendRef,
  //   seller: sellerRef,
  //   map: mapRef,
  //   rank: rankRef,
  //   hot: hotRef,
  //   stock: stockRef,
  // }
  // fullScreenStatus[chartName] = !fullScreenStatus[chartName]
  // await nextTick()
  // refMap[chartName].screenAdapter()

  // 使用socket
  const targetValue = !fullScreenStatus[chartName]
  socket.send({
    action: 'fullScreen',
    socketType: 'fullScreen',
    chartName,
    value: targetValue,
  })
}

async function recvData(data) {
  const { chartName, value: targetValue } = data
  fullScreenStatus[chartName] = targetValue
  await nextTick()
  const refMap = {
    trend: trendRef,
    seller: sellerRef,
    map: mapRef,
    rank: rankRef,
    hot: hotRef,
    stock: stockRef,
  }
  refMap[chartName].screenAdapter()
}

function recvThemeChange() {
  store.commit('changeTheme')
}
</script>

<style lang="less" scoped>
// 全屏样式的定义
.fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  z-index: 100;
}

.screen-container {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  background-color: #161522;
  color: #fff;
  box-sizing: border-box;
}
.screen-header {
  width: 100%;
  height: 64px;
  font-size: 20px;
  position: relative;
  > div {
    img {
      width: 100%;
    }
  }
  .title {
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 20px;
    transform: translate(-50%, -50%);
  }
  .title-right {
    display: flex;
    align-items: center;
    position: absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-80%);
  }
  .qiehuan {
    width: 28px;
    height: 21px;
    cursor: pointer;
  }
  .datetime {
    font-size: 15px;
    margin-left: 10px;
  }
  .logo {
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-80%);
    img {
      height: 35px;
      width: 128px;
    }
  }
}
.screen-body {
  width: 100%;
  height: 100%;
  display: flex;
  margin-top: 10px;
  .screen-left {
    height: 100%;
    width: 27.6%;
    #left-top {
      height: 53%;
      position: relative;
    }
    #left-bottom {
      height: 31%;
      margin-top: 25px;
      position: relative;
    }
  }
  .screen-middle {
    height: 100%;
    width: 41.5%;
    margin-left: 1.6%;
    margin-right: 1.6%;
    #middle-top {
      width: 100%;
      height: 56%;
      position: relative;
    }
    #middle-bottom {
      margin-top: 25px;
      width: 100%;
      height: 28%;
      position: relative;
    }
  }
  .screen-right {
    height: 100%;
    width: 27.6%;
    #right-top {
      height: 46%;
      position: relative;
    }
    #right-bottom {
      height: 38%;
      margin-top: 25px;
      position: relative;
    }
  }
}
.resize {
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
}
</style>
