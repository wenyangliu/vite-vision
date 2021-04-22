<!-- 商家销量统计的横向柱状图 -->
<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref">Seller</div>
  </div>
</template>

<script setup>
import { seller } from '../mock/seller'
import {
  reactive,
  onMounted,
  ref,
  onUnmounted,
  inject,
  useContext,
  computed,
  watch,
} from 'vue'
import { useStore } from 'vuex'
const store = useStore()
const { expose } = useContext()
const echarts = inject('$echarts')
const seller_ref = ref(null)
let chartInstance = null
let timerId = null
const state = reactive({
  allData: null,
  currentPage: 1,
  totalPage: 0,
})

onUnmounted(() => {
  clearInterval(timerId)
  window.removeEventListener('resize', screenAdapter)
})

onMounted(() => {
  initChart()
  getData()
  window.addEventListener('resize', screenAdapter)
  screenAdapter()
})

const theme = computed(() => store.state.theme)

function initChart() {
  chartInstance = echarts.init(seller_ref.value, theme.value)
  const initOption = {
    title: {
      text: '▎商家销售统计',
      left: 20,
      top: 20,
    },
    grid: {
      top: '20%',
      left: '3%',
      right: '6%',
      bottom: '3%',
      containLabel: true, // 距离是包含坐标轴上的文字
    },
    xAxis: {
      type: 'value',
    },
    yAxis: {
      type: 'category',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        z: 0,
        lineStyle: {
          type: 'solid',
          color: '#2D3443',
        },
      },
    },
    series: [
      {
        type: 'bar',
        label: {
          show: true,
          position: 'right',
          color: '#fff',
        },
        itemStyle: {
          // 指明颜色渐变的方向
          // 指明不同百分比之下颜色的值
          // 指明不同百分比之下颜色的值
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              {
                offset: 0,
                color: '#5052EE', // 0% 处的颜色
              },
              {
                offset: 1,
                color: '#AB6EE5', // 100% 处的颜色
              },
            ],
            global: false, // 缺省为 false
          },
        },
      },
    ],
  }
  chartInstance.setOption(initOption)
  chartInstance.on('mouseover', function () {
    clearInterval(timerId)
  })
  chartInstance.on('mouseout', function () {
    startInterval()
  })
}
function getData() {
  state.allData = seller.sort((a, b) => a.value - b.value)
  state.totalPage = Math.ceil(state.allData.length / 5)
  updateChart()
  startInterval()
}

function updateChart() {
  const start = (state.currentPage - 1) * 5,
    end = state.currentPage * 5
  const showData = state.allData.slice(start, end)
  const names = showData.map(it => it.name)
  const values = showData.map(it => it.value)
  const dataOption = {
    yAxis: {
      data: names,
    },
    series: [
      {
        data: values,
      },
    ],
  }
  chartInstance.setOption(dataOption)
}

// 分辨率适配
const screenAdapter = () => {
  const titleFontSize = (seller_ref.value.offsetWidth / 100) * 3.6
  const adapterOption = {
    title: {
      textStyle: {
        fontSize: titleFontSize,
      },
    },
    tooltip: {
      axisPointer: {
        lineStyle: {
          width: titleFontSize,
        },
      },
    },
    series: [
      {
        barWidth: titleFontSize,
        itemStyle: {
          borderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0],
        },
      },
    ],
  }
  chartInstance.setOption(adapterOption)
  chartInstance.resize()
}

function startInterval() {
  timerId = setInterval(() => {
    state.currentPage++
    if (state.currentPage > state.totalPage) {
      state.currentPage = 1
    }
    updateChart()
  }, 3000)
}

// 监听主题变化
watch(theme, (newValue, oldValue) => {
  chartInstance.dispose() // 销毁当前的图表
  initChart() // 重新以最新的主题名称初始化图表对象
  screenAdapter() // 完成屏幕的适配
  updateChart() // 更新图表的展示
})

expose({
  screenAdapter,
})
</script>
