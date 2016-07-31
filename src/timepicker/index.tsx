import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Input from '../../../input/src'
import {Radio, RadioGroup} from '../../../radio/src'
import {Select, Option} from '../../../select/src'
import * as classNames from 'classnames'
import * as $ from 'jquery'
import * as moment from 'moment'
import TransmitTransparently from '../../../../common/transmit-transparently/src'
import * as modules from './module'
import './index.scss'

// 获取两点间的角度
const getAngle = (x1: number, y1: number, x2: number, y2: number) => {
    let position = {
        x: x1,
        y: y1 - Math.sqrt(Math.abs(x2 - x1) * Math.abs(x2 - x1) + Math.abs(y2 - y1) * Math.abs(y2 - y1))
    }
    let angle = (2 * Math.atan2(y2 - position.y, x2 - position.x)) * 180 / Math.PI
    return angle - 90
}

// 小时转换成角度
const hourToAngle = (number: number) => {
    if (number > 12) {
        number -= 12
    }
    return number / 12 * 360 - 90
}

// 时/分钟 转换成角度
const minuteSecondToAngle = (number: number) => {
    return number / 60 * 360 - 90
}

// 角度转化成 小时 数字
const angleToHour = (angle: number, isAm: boolean) => {
    let number = Math.round((angle + 90) / 360 * 11)
    return isAm ? number : number + 12
}

// 角度转化成 时/分钟 数字
const angleToMinuteSecond = (angle: number) => {
    return Math.round((angle + 90) / 360 * 59)
}

// 给出最早可用的时间
const recentValidTime = (number: number, filter: Function) => {
    while (number > 0) {
        if (filter(number)) return number
        number--
    }
    return 0
}

@TransmitTransparently()
export default class Timepicker extends React.Component<modules.PropsDefine, modules.StateDefine> {
    static defaultProps = modules.defaultProps

    private _isMounted: boolean
    private $dom: JQuery
    private $clockEnter: JQuery

    private handleDocumentClick = (event: MouseEvent) => {
        if (!this._isMounted) return
        if (!$.contains(this.$dom[0], event.target as Element)) {
            this.setState({
                show: false
            })
        }
    }

    private handleMouseMove = (event: MouseEvent) => {
        if (!this._isMounted) return
        if (!this.state.show || this.state.moveType === null) return

        let angle = getAngle(this.$clockEnter.offset().left, this.$clockEnter.offset().top, event.pageX - 100, event.pageY - 100)

        let changedState: any = {}

        if (this.state.moveType !== 'hour') {
            changedState[this.state.moveType] = angleToMinuteSecond(angle)
        } else {
            changedState[this.state.moveType] = angleToHour(angle, this.state.isAm)
        }

        // 调整是否可选
        switch (this.state.moveType) {
            case 'hour':
                changedState[this.state.moveType] = recentValidTime(changedState[this.state.moveType], this.props.limitHour)
                changedState[this.state.moveType + 'Angle'] = hourToAngle(changedState[this.state.moveType])
                break
            case 'minute':
                changedState[this.state.moveType] = recentValidTime(changedState[this.state.moveType], this.props.limitMinute)
                changedState[this.state.moveType + 'Angle'] = minuteSecondToAngle(changedState[this.state.moveType])
                break
            case 'second':
                changedState[this.state.moveType] = recentValidTime(changedState[this.state.moveType], this.props.limitSecond)
                changedState[this.state.moveType + 'Angle'] = minuteSecondToAngle(changedState[this.state.moveType])
                break
        }

        changedState.isChanged = true

        this.setState(changedState, () => {
            this.props.onChange(moment({
                hour: this.state.hour,
                minute: this.state.minute,
                second: this.state.second
            }))
        })
    }

    private handleMouseUp = () => {
        if (!this._isMounted) return
        this.setState({
            moveType: null
        })
    }

    constructor(props: modules.PropsDefine) {
        super(props)

        let now = new Date()
        let hour = this.props.hour || this.props.defaultHour || now.getHours()
        let minute = this.props.minute || this.props.defaultMinute || now.getMinutes()
        let second = this.props.second || this.props.defaultSecond || now.getSeconds()

        hour = recentValidTime(hour, this.props.limitHour)
        minute = recentValidTime(minute, this.props.limitMinute)
        second = recentValidTime(second, this.props.limitSecond)

        let defaultState: modules.StateDefine = Object.assign({}, modules.defaultState)
        defaultState.hourAngle = hourToAngle(hour)
        defaultState.minuteAngle = minuteSecondToAngle(minute)
        defaultState.secondAngle = minuteSecondToAngle(second)
        defaultState.hour = hour
        defaultState.minute = minute
        defaultState.second = second
        defaultState.isAm = hour <= 12

        this.state = defaultState
    }

    componentWillReceiveProps(nextProps: modules.PropsDefine) {
        if ('hour' in nextProps || 'minute' in nextProps || 'second' in nextProps) {
            this.setState({
                hour: nextProps.hour || this.state.hour,
                minute: nextProps.minute || this.state.minute,
                second: nextProps.second || this.state.second,
                isChanged: true
            })
        }
    }

    componentDidMount() {
        this._isMounted = true
        this.$dom = $(ReactDOM.findDOMNode(this))
        const $document: any = $(document)
        $document.on('click', this.handleDocumentClick)
        $document.on('mousemove', this.handleMouseMove)
        $document.on('mouseup', this.handleMouseUp)
    }

    componentWillUnmount() {
        this._isMounted = false
        const $document: any = $(document)
        $document.off('click', this.handleDocumentClick)
        $document.off('mousemove', this.handleMouseMove)
        $document.off('mouseup', this.handleMouseUp)
    }

    handleFocus() {
        let position = 'bottom'
        if (this.$dom.offset().top > 300) {
            position = 'top'
        }

        this.setState({
            show: true,
            position: position
        }, () => {
            // 获取时钟中心点
            this.$clockEnter = this.$dom.find('#j-clock-container')
        })
    }

    handleMouseDown(type: string) {
        this.setState({
            moveType: type
        })
    }

    handleTimeChange(type: string, value: number) {
        let angle = 0
        let newState: any = {}

        switch (type) {
            case 'hour':
                value = recentValidTime(value, this.props.limitHour)
                break
            case 'minute':
                value = recentValidTime(value, this.props.limitMinute)
                break
            case 'second':
                value = recentValidTime(value, this.props.limitSecond)
                break
        }

        if (type === 'hour') {
            angle = hourToAngle(value)
            newState.isAm = value <= 12
        } else {
            angle = minuteSecondToAngle(value)
        }

        newState[type] = value
        newState[type + 'Angle'] = angle
        newState.isChanged = true

        this.setState(newState, () => {
            this.props.onChange(moment({
                hour: this.state.hour,
                minute: this.state.minute,
                second: this.state.second
            }))
        })
    }

    getHours() {
        let arrs: Array<number> = []
        for (let i = 0; i < 24; i++) {
            if (!this.props.limitHour(i)) continue
            arrs.push(i)
        }

        return arrs.map((item, index) => {
            return (
                <Option key={index}
                    value={item}>{item}</Option>
            )
        })
    }

    getMinutes() {
        let arrs: Array<number> = []
        for (let i = 0; i < 60; i++) {
            if (!this.props.limitMinute(i)) continue
            arrs.push(i)
        }

        return arrs.map((item, index) => {
            return (
                <Option key={index}
                    value={item}>{item}</Option>
            )
        })
    }

    getSeconds() {
        let arrs: Array<number> = []
        for (let i = 0; i < 60; i++) {
            if (!this.props.limitSecond(i)) continue
            arrs.push(i)
        }

        return arrs.map((item, index) => {
            return (
                <Option key={index}
                    value={item}>{item}</Option>
            )
        })
    }

    handleAmChange(value: string) {
        switch (value) {
            case 'am':
                this.setState({
                    hour: this.state.hour > 12 ? this.state.hour - 12 : this.state.hour,
                    isAm: true,
                    isChanged: true
                }, () => {
                    this.props.onChange(moment({
                        hour: this.state.hour,
                        minute: this.state.minute,
                        second: this.state.second
                    }))
                })
                break
            case 'pm':
                this.setState({
                    hour: this.state.hour > 12 ? this.state.hour : this.state.hour + 12,
                    isAm: false,
                    isChanged: true
                }, () => {
                    this.props.onChange(moment({
                        hour: this.state.hour,
                        minute: this.state.minute,
                        second: this.state.second
                    }))
                })
                break
        }
    }

    render() {
        const classes = classNames({
            '_namespace': true,
            [this.props['className']]: !!this.props['className']
        })

        let containerClass = classNames({
            'container': true,
            [this.state.position]: true,
            'show': this.state.show,
            'hide': !this.state.show
        })

        let hourStyle = {
            transform: `rotate(${this.state.hourAngle}deg)`,
            transition: this.state.moveType === null ? `all .2s` : `background .1s`
        }
        let minuteStyle = {
            transform: `rotate(${this.state.minuteAngle}deg)`,
            transition: this.state.moveType === null ? `all .2s` : `background .1s`
        }
        let secondStyle = {
            transform: `rotate(${this.state.secondAngle}deg)`,
            transition: this.state.moveType === null ? `all .2s` : `background .1s`
        }

        let momentObj = moment({
            hour: this.state.hour,
            minute: this.state.minute,
            second: this.state.second
        })

        return (
            <div className={classes} {...this.props.others}>
                <Input onFocus={this.handleFocus.bind(this) }
                    {...this.props.input}
                    icon="clock-o"
                    value={this.state.isChanged ? momentObj.format(`HH:mm:ss`) : ''}/>

                {this.state.show ?
                    <div className={containerClass}>
                        <div id="j-clock-container"
                            className="clock">
                            <div className="hour"
                                style={hourStyle}
                                onMouseDown={this.handleMouseDown.bind(this, 'hour') }>
                                <div className="hour-needle"></div>
                            </div>
                            <div className="minute"
                                style={minuteStyle}
                                onMouseDown={this.handleMouseDown.bind(this, 'minute') }>
                                <div className="minute-needle"></div>
                            </div>
                            <div className="second"
                                style={secondStyle}
                                onMouseDown={this.handleMouseDown.bind(this, 'second') }>
                                <div className="second-needle"></div>
                            </div>
                        </div>

                        <div className="toolbar">
                            <RadioGroup type="button"
                                onChange={this.handleAmChange.bind(this) }
                                value={this.state.isAm ? 'am' : 'pm'}>
                                <Radio value="am">AM</Radio>
                                <Radio value="pm">PM</Radio>
                            </RadioGroup>
                        </div>

                        <div className="time-select-container">
                            <Select label=""
                                simple={true}
                                style={{ margin: 0, width: 50 }}
                                value={this.state.hour}
                                onChange={this.handleTimeChange.bind(this, 'hour') }>
                                {this.getHours() }
                            </Select>
                            <span>: </span>
                            <Select label=""
                                simple={true}
                                style={{ margin: '0 0 0 10px', width: 50 }}
                                value={this.state.minute}
                                onChange={this.handleTimeChange.bind(this, 'minute') }>
                                {this.getMinutes() }
                            </Select>
                            <span>: </span>
                            <Select label=""
                                simple={true}
                                style={{ margin: '0 0 0 10px', width: 50 }}
                                value={this.state.second}
                                onChange={this.handleTimeChange.bind(this, 'second') }>
                                {this.getSeconds() }
                            </Select>
                        </div>
                    </div> : null
                }
            </div>
        )
    }
}