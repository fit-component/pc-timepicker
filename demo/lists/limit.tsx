import * as React from 'react'
import TimePicker from '../../src'

export default class Demo extends React.Component <any, any> {
    limitHour(number:number) {
        return number > 7
    }

    limitMinute(number:number) {
        return number % 2
    }

    limitSecond(number:number) {
        return !(number % 5)
    }

    render() {
        return (
            <div>
                <TimePicker limitHour={this.limitHour.bind(this)}
                            limitMinute={this.limitMinute.bind(this)}
                            limitSecond={this.limitSecond.bind(this)}/>
            </div>
        )
    }
}