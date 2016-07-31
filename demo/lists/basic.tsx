import * as React from 'react'
import TimePicker from '../../src'

export default class Demo extends React.Component <any, any> {
    handleChange(moment:any) {

    }

    render() {
        return (
            <div>
                <TimePicker onChange={this.handleChange.bind(this)}/>
            </div>
        )
    }
}