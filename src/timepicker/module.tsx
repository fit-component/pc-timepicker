export interface PropsDefine {
    /**
     * 内容改变的回调
     */
    onChange?: (time: any) => void
    /**
     * 小时约束
     */
    limitHour?: (number: number) => boolean
    /**
     * 分钟约束
     */
    limitMinute?: (number: number) => boolean
    /**
     * 秒约束
     */
    limitSecond?: (number: number) => boolean
    /**
     * 输入框配置
     */
    input?: any
    /**
     * 当前 时 数值
     */
    hour?: number
    /**
     * 当前 分 数值
     */
    minute?: number
    /**
     * 当前 秒 数值
     */
    second?: number
    /**
     * 当前 时 默认数值
     */
    defaultHour?: number
    /**
     * 当前 分 默认数值
     */
    defaultMinute?: number
    /**
     * 当前 秒 默认数值
     */
    defaultSecond?: number
    /**
     * 透传组件
     */
    others?: any

    [x: string]: any
}

export const defaultProps: PropsDefine = {
    onChange: (time) => {
    },
    limitHour: (number) => {
        return true
    },
    limitMinute: (number) => {
        return true
    },
    limitSecond: (number) => {
        return true
    },
    input: {}
}

export interface StateDefine {
    /**
     * 是否显示
     */
    show?: boolean
    /**
     * 位置
     */
    position?: string
    /**
     * 当前移动的 小时/分钟/秒
     */
    moveType?: string
    /**
     * 当前 时 所在角度
     */
    hourAngle?: number
    /**
     * 当前 分 所在角度
     */
    minuteAngle?: number
    /**
     * 当前 秒 所在角度
     */
    secondAngle?: number
    /**
     * 当前 时 数值
     */
    hour?: number
    /**
     * 当前 分 数值
     */
    minute?: number
    /**
     * 当前 秒 数值
     */
    second?: number
    /**
     * 时刻
     */
    isAm?: boolean
    /**
     * 是否触发过修改,如果没有修改,显示空
     */
    isChanged?: boolean
}

export const defaultState: StateDefine = {
    show: false,
    position: 'bottom',
    moveType: null,
    isChanged: false
}