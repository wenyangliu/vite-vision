<!-- 商家分布图表 -->
<template>
  <div class="com-container" @dblclick="revertMap">
    <div class="com-chart" ref="map_ref"></div>
  </div>
</template>

<script setup>
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
import { getProvinceMapInfo } from '@/utils/map_utils'
import { mapArr } from '../mock/map'
import { useStore } from 'vuex'
const store = useStore()
const { expose } = useContext()
const echarts = inject('$echarts')
const axios = inject('$axios')
const map_ref = ref(null)
let chartInstance = null
const state = reactive({
  allData: null,
  mapData: {},
})

onUnmounted(() => {
  window.removeEventListener('resize', screenAdapter)
})

onMounted(() => {
  initChart()
  getData()
  window.addEventListener('resize', screenAdapter)
  screenAdapter()
})

const theme = computed(() => store.state.theme)

async function initChart() {
  chartInstance = echarts.init(map_ref.value, theme.value)
  const ret = await axios.get('/static/map/china.json')
  echarts.registerMap('china', ret.data)
  const initOption = {
    title: {
      text: '▎商家分布',
      left: 20,
      top: 20,
    },
    geo: {
      type: 'map',
      map: 'china',
      top: '5%',
      bottom: '5%',
      itemStyle: {
        areaColor: '#2e72bf',
        borderColor: '#333',
      },
    },
    legend: {
      left: '5%',
      bottom: '5%',
      orient: 'vertical', // 布局朝向
    },
  }
  chartInstance.setOption(initOption)
  chartInstance.on('click', async arg => {
    const provinceInfo = getProvinceMapInfo(arg.name)
    if (!state.mapData[provinceInfo.key]) {
      const ret = await axios.get(provinceInfo.path)
      state.mapData[provinceInfo.key] = ret.data
      echarts.registerMap(provinceInfo.key, ret.data)
    }
    const changeOption = {
      geo: {
        map: provinceInfo.key,
      },
    }
    chartInstance.setOption(changeOption)
  })
}
function getData() {
  updateChart()
}

function updateChart() {
  const seriesArr = [],
    legendArr = []
  mapArr.forEach(it => {
    legendArr.push(it.name)
    seriesArr.push({
      type: 'effectScatter',
      coordinateSystem: 'geo',
      rippleEffect: {
        scale: 5,
        brushType: 'stroke', // stroke(涟漪) fill(扩散)
      },
      name: it.name,
      data: it.children,
    })
  })
  const dataOption = {
    legend: {
      data: legendArr,
    },
    series: seriesArr,
  }
  chartInstance.setOption(dataOption)
}

// 分辨率适配
const screenAdapter = () => {
  const titleFontSize = (map_ref.value.offsetWidth / 100) * 3.6
  const adapterOption = {
    title: {
      textStyle: {
        fontSize: titleFontSize,
      },
    },
    legend: {
      itemWidth: titleFontSize / 2,
      itemHeight: titleFontSize / 2,
      itemGap: titleFontSize / 2,
      textStyle: {
        fontSize: titleFontSize / 2,
      },
    },
  }
  chartInstance.setOption(adapterOption)
  chartInstance.resize()
}

// 双击回到中国地图
function revertMap() {
  const revertOption = {
    geo: {
      map: 'china',
    },
  }
  chartInstance.setOption(revertOption)
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
