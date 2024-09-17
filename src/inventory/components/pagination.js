import React, { Component } from "react";

export default class Pagination extends Component {
  constructor(props) {
    super(props);
  }

  updateFunc(value){
    this.props.updatePagination({
        ...this.props.pagination,
        page: value
    });
  }

  componentDidUpdate(prevProps,prevState){
    if (prevProps.pagination.limit!==this.props.pagination.limit){

       this.settingPage()
    }


  }
    changepage = (type) => {
        const { page, limit, total } = this.props.pagination;
        const currentPage = page;
        // const newPage = type === "minus" ? currentPage - 1 : currentPage + 1;
        // console.log(total/limit,"77777")
        // console.log((Math.ceil(total/limit))>currentPage,currentPage<=1)

        // if (!((Math.ceil(total/limit))>currentPage)||currentPage<=1){
        //     return
        // }else{
        console.log(total,limit,currentPage)

        if(type==="plus"&&Math.ceil(total/limit)>currentPage){
             const newPage=currentPage+1
            //  this.props.updatePagination({
            //     ...this.props.pagination,
            //     page: newPage
            // });
            this.updateFunc(newPage)
        } else if (type==="minus"&&currentPage>1){
            const newPage=currentPage-1
            this.updateFunc(newPage)

        //     this.props.updatePagination({
        //        ...this.props.pagination,
        //        page: newPage
        //    });

        }
           
        // }

        
    };

    setPage=(i)=>{
        this.updateFunc(i);

    }



  settingPage = () => {
    const { page, limit, total } = this.props.pagination;

    let pages = [];
    let minpage = page - 1;
    let maxpage = page + 1;
   const  totalPage=Math.ceil(total/limit)

    for (let i = 1; i <= totalPage; i++) {
      if (i === 1 || i >= minpage && i <= maxpage||i===totalPage) {
        pages.push(<button className={`btn-des ${i===page? 'active':''} `} onClick={()=>this.setPage(i)}>{i}</button>);
      } else if (i === minpage - 1 || i === maxpage + 1) {
        pages.push(<button className="btn-des">...</button>);
      }
    }
    
    return pages;
  };

  render() {
    const { total, limit, page } = this.props.pagination;
    return (
      <div className="full-wrapper">
        <div className="count-wrapper">
          <span>Showing</span>
          <span className="ml-1">
            {!total ? 0 : (page - 1) * limit <= 0 ? 1 : (page - 1) * limit + 1}
          </span>
          <span className="ml-1">to</span>
          <span className="ml-1">
            {!total ? 0 : page * limit <= total ? page * limit : total}
          </span>
          <span className="ml-1">of</span>
          <span className="ml-1">{total}</span>
          <span className="ml-1">entries</span>
        </div>
        <div className="button-wrapper ">
          <button  onClick={() => this.changepage('minus')}  className="btn-prev">previous</button>
          {this.settingPage().map((item, i) => {
            return <div key={i}>{item}</div>  
          })}
          <button onClick={() => this.changepage('plus')} className="btn-next">Next</button>
        </div>
      </div>
    );
  }
}
