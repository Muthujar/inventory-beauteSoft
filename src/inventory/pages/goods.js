import React, { Component } from "react";
import AddInventory from "./addInventory";
import Table from "../components/table";
import Apiservice from "../constants/apiservice";
import { queryParamsGenerate } from "../utils";
import printer from "../assets/icons/print-solid.svg";
import moment from "moment";
import Toast from "../components/toast";

export default class Goods extends Component {
  constructor(props) {
    super(props);
    this.toastRef = React.createRef(); // Reference to Toast component

    this.state = {
      activeFilter: "Open",
      showSpinner: false,
      goodsData: [],
      slicedData: [],
      orderBy: "asc",

      filter: {
        docStatus: "0",
        movCode: "GRN",
      },
      propDocdata: {
        docNo:'',
        docStatus:''
      },
      pagination: {
        limit: 10,
        page: 1,
        total: "",
        name: "",
      },
      searchValue: "",
      showSuccessToast: false,
      message: "",
    };
  }

  componentDidMount() {
    this.setState({ showSpinner: true });
    const query = queryParamsGenerate(this.state.filter);
    console.log(query);
    console.log(this.toastRef,'tio')

    this.getNoteTable();
  }

  componentDidUpdate = async (prevProps, prevState) => {
    const { pagination, filter, goodsData } = this.state;

    if (
      prevState.pagination.limit !== pagination.limit ||
      prevState.pagination.page !== pagination.page ||
      prevState.pagination.total !== pagination.total ||
      prevState.pagination.name !== pagination.name
    ) {
      if (pagination.name) {
        console.log("Searching with pagination.name");

        const data = await this.handleSearch(pagination.name);
        this.pageLimit(data);

        this.updatePagination({
          total: data.length,
        });
      } else {
        console.log("No search term, using goodsData");

        this.updatePagination({
          total: goodsData.length,
        });

        this.pageLimit(goodsData);
      }
    }

    // Check if the filter's docStatus has changed
    if (prevState.activeFilter !== this.state.activeFilter) {

        if (this.state.activeFilter!=='all'){

        this.setState(
          (prevState) => ({
            goodsData: [],
            slicedData: [],
            pagination: {
              ...prevState.pagination,
              page: 1
            },
            filter: {
              ...prevState.filter,
            //   docStatus: this.state.filter.docStatus === 'all' ? '' : this.state.filter.docStatus
            }
          }),
          this.getNoteTable // callback to trigger getNoteTable after state update
        );
      }
    }

  };

  updatePagination = (newPagination) => {
    this.setState((prevState) => ({
      pagination: {
        ...prevState.pagination,
        ...newPagination,
      },
    }));
  };

  //   handleSearch = async (value) => {
  //     console.log(value, 'value');

  //     const filteredItems = this?.state?.goodsData?.filter((items) => {
  //       console.log(items);
  //       return (
  //         items?.docNo?.toLocaleLowerCase().includes(value.toLowerCase()) ||
  //         moment(items?.docDate)?.format(`DD/MM/YYYY`).includes(value) ||
  //         items.docRef1.toLocaleLowerCase().includes(value.toLocaleLowerCase()) ||
  //         items.supplyNo
  //           .toString()
  //           .toLocaleLowerCase()
  //           .includes(value.toLocaleLowerCase()) ||
  //         items?.docAmt
  //           ?.toString()
  //           .toLocaleLowerCase()
  //           ?.includes(value.toLocaleLowerCase())
  //       );
  //     });
  handleSearch = (value) => {
    let debounceTimer;
    this.setState({ showSpinner: true });

    return new Promise((resolve, reject) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(() => {
        try {
          console.log(value, "value");

          const filteredItems = this?.state?.goodsData?.filter((items) => {
            return (
              items?.docNo?.toLowerCase().includes(value.toLowerCase()) ||
              moment(items?.docDate)?.format("DD/MM/YYYY").includes(value) ||
              items?.docRef1?.toLowerCase().includes(value.toLowerCase()) ||
              items?.supplyNo
                ?.toString()
                .toLowerCase()
                .includes(value.toLowerCase()) ||
              items?.docAmt
                ?.toString()
                ?.toLowerCase()
                ?.includes(value.toLowerCase())
            );
          });
          let pagina = {
            total: filteredItems.length,
          };
          this.updatePagination(pagina);

          console.log(filteredItems, "filteredItems");

          resolve(filteredItems);
        } catch (error) {
          reject(error);
        }
      }, 500); 
    });
  };


  setSlicedData = (data) => {
    this.setState({
      slicedData: data,
    });
  };

  printNote = (item) => {
    window.print(item);
  };
  pageLimit = (filtered) => {
    const { pagination, goodsData } = this.state;
    let startIndex = (pagination.page - 1) * pagination.limit;
    let endIndex = startIndex + pagination.limit;
    const sliced = filtered?.slice(startIndex, endIndex);
    this.setSlicedData(sliced);
    this.setState({ showSpinner: false });
  };

  getNoteTable = () => {
    Apiservice()
      .getAPI(`StkMovdocHdrs${queryParamsGenerate(this.state.filter)}`)
      .then((res) => {
        this.setState({
          goodsData: res,
          pagination: {
            ...this.state.pagination,
            total: res.length,
          },
          showSpinner: false,
        });

        this.pageLimit(res);
      })
      .catch((err) => {});
  };

  handleFilter = (status, index) => {

    // let item=this.state.slicedData[index]
    console.log(status,'passitem')
    const value = status === "Open" ? 0 : status === "Posted" ? 7 : null;

    this.setState((prevState) => ({
      activeFilter: status,
      propDocdata: {
        docNo:null,
        docStatus:null
        
      },
      pagination: {
        ...prevState.pagination,
        name: "",
        page: 1,
      },
      showSpinner: true,
      filter: {
        ...prevState.filter,
        docStatus: value,
      },
    }));
  };

  handleDetails=(item,i)=>{

    this.setState((prevState) => ({
        activeFilter: 'New',
        propDocdata: {
          docNo:item?.docNo??null,
          docStatus:item?.docStatus?? null
        },
        // pagination: {
        //   ...prevState.pagination,
        //   name: "",
        //   page: 1,
        // },
        // showSpinner: true,
        // filter: {
        //   ...prevState.filter,
        //   docStatus: value,
        // },
      }));


  }

  routeto = (message) => {
    this.setState({
      activeFilter: "Open",
      filter: {
        ...this.state.filter,
        docStatus: 0,
        propDocdata: {
            docNo:null,
            docStatus: null
          },
      },
    });
    if (message)this.showToastMessage(message)
  };

  showToastMessage = (message) => {

    console.log(message,'mes')
    this.setState({
        showSuccessToast: true,
        message: message,
      });
      setTimeout(() => {
        this.setState({ showSuccessToast: false });
      }, 2000);

    // if (this.toastRef.current) {
    //     this.toastRef.current.setToastMessage(message);

    //   }  
    };


  handleSort = (sortkey, order) => {
    console.log(sortkey);
    console.log(this.state.orderBy, "order");
    let { slicedData, headerDetails, orderBy } = this.state;
    this.setState({
      orderBy: this.state.orderBy == "asc" ? "desc" : "asc",
    });
    if (orderBy === "asc") {
      slicedData.sort((a, b) =>
        a[sortkey] > b[sortkey] ? 1 : b[sortkey] > a[sortkey] ? -1 : 0
      );
    } else {
      slicedData.sort((a, b) =>
        a[sortkey] < b[sortkey] ? 1 : b[sortkey] < a[sortkey] ? -1 : 0
      );
    }
    this.setState({
      slicedData,
    });
  };

  dateConvert = (value) => {
    const date = new Date(value);

    const day = String(date.getDate()).padStart(2, "0"); // Get the day and pad with 0 if necessary
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Get the month and pad, months are zero-indexed
    const year = date.getFullYear(); // Get the full year

    return `${day}/${month}/${year}`; // Return the date in dd/mm/yyyy format
    //    return new Date(date)
  };

  render() {
    const {
      activeFilter,
      showSpinner,
      goodsData,
      pagination,
      changePage,
      slicedData,
      orderBy,
      showSuccessToast,
      message
    } = this.state;
    const filters = ["Open", "Posted", "All", "New"];
    const headerDetails = [
      {
        label: "Doc Number",
        sortKey: "Doc Number",
        enabled: true,
        // orderBy: "asc",
        id: "itemCode",
        singleClickFunc: () => this.handleSort("docNo"),
        divClass: "d-flex justify-content-between",
      },
      {
        label: "Invoice Date",
        sortKey: "Invoice Date",
        enabled: false,
        id: "itemCode",
        singleClickFunc: () => this.handleSort("itemCode"),
        divClass: "d-flex justify-content-between",
      },
      {
        label: "Ref Num",
        sortKey: "Ref Num",
        enabled: false,
        id: "itemCode",
        singleClickFunc: () => this.handleSort("itemCode"),
        divClass: "d-flex justify-content-between",
      },
      {
        label: "Supplier",
        sortKey: "Supplier",
        enabled: false,
        id: "itemCode",
        singleClickFunc: () => this.handleSort("itemCode"),
        divClass: "d-flex justify-content-between",
      },
      {
        label: "Total Amount",
        sortKey: "Total Amount",
        enabled: false,
        id: "itemCode",
        singleClickFunc: () => this.handleSort("itemCode"),
        divClass: "d-flex justify-content-between",
      },
      {
        label: "Status",
        sortKey: "Status",
        id: "itemCode",
        singleClickFunc: () => this.handleSort("itemCode"),
        divClass: "d-flex justify-content-between",
      },
      {
        label: "Print",
        // sortKey: "Print",
        id: "itemCode",
        singleClickFunc: () => this.handleSort("itemCode"),
        divClass: "d-flex justify-content-between",
      },
    ];

    return (
      <div className="notes-wrapper">
        <div className="notes-container">
          <div className="title">Goods Receive Note List</div>

          <div className="notes-filter">
            {filters.map((item, i) => (
              <div
                key={i}
                onClick={() => this.handleFilter(item)}
                className={`btn-filter ${
                  activeFilter === item ? "active" : ""
                }`}
              >
                {item}
              </div>
            ))}
            {/* <div className="btn-filter">Posted</div>
            <div className="btn-filter">All</div>

            <div className="btn-filter">New</div> */}
          </div>
        </div>

        {activeFilter === "New" ? (
          <AddInventory
            routeto={this.routeto}
            docData={this.state.propDocdata?.docNo ?this.state.propDocdata: null}
          />
        ) : (
            <div
          >
            <Table 
            
              headerDetails={headerDetails}
              pagination={pagination}
              updatePagination={this.updatePagination}
            //   setFilteredData={this.setFilteredData}
              tableData={goodsData}
              orderBy={orderBy}
            //   updateSearch={this.updateSearch}
            >
                  <Toast ref={this.toastRef} />

              {showSpinner ? (
                <tr>
                  <td colSpan={7}>
                    <div className="spinner-container">
                      <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : slicedData?.length > 0 ? (
                slicedData.map((item, i) => {
                  return (
                    <tr>
                      <td
                        onClick={() => this.handleDetails(item, i)}
                        className="cursor-pointer"
                      >
                        {item.docNo}
                      </td>
                      <td>{this.dateConvert(item.docDate)}</td>
                      <td>{item.docRef1 ? item.docRef1 : "-"}</td>
                      <td>{item.supplyNo}</td>
                      <td>{item.docAmt}</td>
                      <td>{item.docStatus}</td>
                      <td>
                        <img
                          onClick={() => this.printNote(item)}
                          className="icon-print"
                          src={printer}
                        ></img>
                        {/* <FontAwesomeIcon icon={fas.faHouse} />  */}
                        {/* <i className=" fa-spin"></i> */}
                        {/* <i className="fa-solid fa-print"></i>        */}
                        {/* {item.DocNumber} */}
                        {/* <i class="fa-solid fa-print"></i> */}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className="no-data-row">
                  <td className="no-data-cell" colSpan={7}>
                    No Data
                  </td>
                </tr>
              )}
            </Table>
            {/* <div className="title">{pagination.page}</div> */}
          </div>

        )}
                          {/* <Toast ref={this.toastRef} /> */}
                          {showSuccessToast && (
  <div
    className="toast show align-items-center text-bg-success border-0"
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
  >
    <div className="d-flex">
      <div className="toast-body">{message}</div>
      <button
        type="button"
        className="btn-close btn-close-white me-2 m-auto"
        aria-label="Close"
        onClick={() => this.setState({ showSuccessToast: false })}
      ></button>
    </div>
  </div>
)}

      </div>
    );
  }
}
