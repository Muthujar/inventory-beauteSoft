import React, { Component } from 'react'
import Sidebar from './components/sidebar'
import Maincontent from './maincontent'

export default class Layout extends Component {

  render() {
    return (
      <div className='wrapper'>

       <div className='sidebar-layout'>
       <Sidebar/>
        </div> 
        <div className='main-layout'>
        <Maincontent/>

        </div>


      </div>
    )
  }
}
