import React, { Component } from "react";
import AddInventory from "./addInventory";
import Table from "../components/table";
import Apiservice from "../constants/apiservice";
import { queryParamsGenerate } from "../utils";
import printer from "../assets/icons/print-solid.svg";
import moment from "moment";

export default class Goods extends Component {
  constructor(props) {
    super(props);
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
      propDocNo: null,
      pagination: {
        limit: 10,
        page: 1,
        total: "",
        name: "",
      },
      searchValue: "",
    };
  }

  componentDidMount() {
    this.setState({ showSpinner: true });
    const query = queryParamsGenerate(this.state.filter);
    console.log(query);

    this.getNoteTable();
  }

  componentDidUpdate(prevProps, prevState) {
    // Check if the page number has changed
    if (
      prevState.pagination.limit !== this.state.pagination.limit ||
      prevState.pagination.page !== this.state.pagination.page ||
      prevState.pagination.total !== this.state.pagination.total ||
      prevState.pagination.name !== this.state.pagination.name
    ) {
      this.pageLimit();
    }
    if (prevState.filter.docStatus !== this.state.filter.docStatus) {
      this.state.goodsData = [];
      this.state.slicedData = [];
      this.state.pagination.page = 1;
      this.getNoteTable();
    }
    if( prevState.searchValue !== this.state.searchValue){
        this.handleSearch(this?.state?.searchValue)
        console.log(this?.state?.searchValue,'search')
      }
  }

  updatePagination = (newPagination) => {
    // this.setState({ pagination: newPagination });
    this.setState((prevState) => ({
      pagination: {
        ...prevState.pagination,
        ...newPagination,
      },
    }));
  };
  handleSearch = (value) => {
    const filteredItems = this?.state?.goodsData?.filter((items) => {
      console.log(items);
      return (
        items?.docNo?.toLocaleLowerCase().includes(value.toLowerCase()) ||
        moment(items?.docDate)?.format(`DD/MM/YYYY`).includes(value) ||
        items.docRef1.toLocaleLowerCase().includes(value.toLocaleLowerCase()) ||
        items.supplyNo
          .toString()
          .toLocaleLowerCase()
          .includes(value.toLocaleLowerCase()) ||
        items?.docAmt
          ?.toString()
          .toLocaleLowerCase()
          ?.includes(value.toLocaleLowerCase())
      );
    });
    this.setFilteredData(filteredItems);
  };
  updateSearch = (value) => {
    this.setState((prevState) => ({
      searchValue: value,
    }));
  };
  setFilteredData = (data) => {
    this.setState({
      slicedData: data,
    });
  };

  printNote = (item) => {
    window.print(item);
  };
  pageLimit = () => {
    const { pagination, goodsData } = this.state;
    let startIndex = (pagination.page - 1) * pagination.limit;
    let endIndex = startIndex + pagination.limit;
    const filtered = goodsData?.slice(startIndex, endIndex);
    this.setFilteredData(filtered);
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

        this.pageLimit();
      })
      .catch((err) => {});
  };

  handleFilter = (status, data) => {
    console.log(status);

    let value;
    if (status === "Open") value = 0;
    else if (status === "Posted") value = 7;
    else value = "";
    this.setState({
      activeFilter: status,
      propDocNo: data,
      filter: {
        ...this.state.filter,
        docStatus: value,
      },
    });
  };

  routeto = () => {
    this.setState({
      activeFilter: "Open",
      filter: {
        ...this.state.filter,
        docStatus: 0,
      },
    });
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
            docNo={this.state.propDocNo ?? null}
          />
        ) : (
          <div>
            <Table
              headerDetails={headerDetails}
              pagination={pagination}
              updatePagination={this.updatePagination}
              setFilteredData={this.setFilteredData}
              tableData={goodsData}
              orderBy={orderBy}
              updateSearch={this.updateSearch}

            >
              {showSpinner ? (
                <tr>
                  <div className="spinner-border loadingSpinner" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </tr>
              ) : slicedData?.length > 0 ? (
                slicedData.map((item, i) => {
                  return (
                    <tr>
                      <td
                        onClick={() => this.handleFilter("New", item.docNo)}
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
      </div>
    );
  }
}
