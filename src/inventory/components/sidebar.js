import React, { Component } from "react";
import { Link } from "react-router-dom";
import send from "../assets/icons/send.png";
import checklist from "../assets/icons/checklists.png";
// import { withRouter } from 'react-router-dom';
import withRouter from "./withRouter";


 class Sidebar extends Component {
  constructor(props) {
    super(props);
  }

  sidebarLinks = [
    { path: "/inventory", icon: checklist, title: "Inventory" },
    { path: "/goods-receive-note", icon: send, title: "Goods Receive Note" },
    { path: "/goods-transfer-out", icon: send, title: "Goods Transfer Out" },
    { path: "/goods-transfer-in", icon: send, title: "Goods Transfer In" },
    { path: "/good-return-note", icon: send, title: "Good Return Note" },
    { path: "/stock-adjustment", icon: send, title: "Stock Adjustment" },
    { path: "/purchase-order", icon: send, title: "Purchase Order" },
    {
      path: "/approved-purchase-order",
      icon: send,
      title: "Approved Purchase Order",
    },
    {
      path: "/purchase-order-approval",
      icon: send,
      title: "Purchase Order Approval",
    },
  ];

  componentDidMount = () => {
    //display the id when the component mounts
    // console.log("Location:", this.props.location);
    // console.log("Params:", this.props.params);    
    }



  render() {
    const { location } = this.props;


    const urlPath='/'+location.pathname.split('/')[1]



    return (
      <div className="sidebar-container">
        <div className="m-text">Main menu</div>
        {this.sidebarLinks.map((item, i) => (
          <Link className={`side-link `} to={item.path} key={i}>
            <div
              className={`
                ${item.title === "Inventory"
                  ? "sidebar-list sidebar-list-a"
                  : "sidebar-list sidebar-list-b"}
                  ${item.title==='Goods Transfer In'||item.title==='Purchase Order'?'link-bottom':''}
              `}
            >
              <img className="icon-size" src={item.icon} alt="icon"></img>
              <p
                className={
                  `side-text ${item.title === "Inventory" ? "side-text-a" : ""}
                  ${item.path===urlPath?'side-text-active': ''}`
                }
              >
                {item.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  }
}
export default withRouter(Sidebar)

