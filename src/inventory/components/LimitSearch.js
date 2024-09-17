import React, { Component } from 'react'
import Select from "react-select";


export default class LimitSearch extends Component {

    changeLimitandSearch=(field,value)=>{
        this.props.updatePagination({
            page:1,
            [field]:value})
      }


  render() {
    let {
        limit,
        search,
        page,
        updatePagination
      } = this.props;

      const limitOptions = [
        { value: 5, label: '5' },
        { value: 10, label: '10' },
        { value: 20, label: '20' },
        { value: 30, label: '30' },
        { value: 40, label: '40' },

        { value: 50, label: '50' }
      ];
      const propsLimit= {value: limit, label: JSON.stringify(limit) }

 
    return (
      <div className='limit-search-container'>

              <div className='limit-table'>
                <div>Show</div>
                {/* <input className='input-limit' value={limit}></input> */}
                <Select className="select-field" 
                 value={propsLimit}
                 onChange={(option)=>this.changeLimitandSearch('limit',option.value)} options={limitOptions} />

                <div className='ml-1'>entries</div>

              </div>
              <div className='search-table'>
                <input placeholder='Search by' className='input-search'></input>
              </div>
            </div>
    )
  }
}
