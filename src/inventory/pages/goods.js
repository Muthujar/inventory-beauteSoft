import React, { Component } from "react";
import AddInventory from "./addInventory";
import Table from "../components/table";
import Apiservice from "../constants/apiservice";
import { queryParamsGenerate } from "../utils";
import printer from "../assets/icons/print-solid.svg";
import moment from "moment";
import Toaster, { showSuccessToast } from "../components/toaster";
import ToastComponent from "../components/toaster";

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
      propDocdata: {
        docNo: "",
        docStatus: "",
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
    this.getNoteTable();
  }

  componentDidUpdate = async (prevProps, prevState) => {
    const { pagination, goodsData, filter } = this.state;

    if (
      prevState.pagination.limit !== pagination.limit ||
      prevState.pagination.page !== pagination.page ||
      prevState.pagination.total !== pagination.total ||
      prevState.pagination.name !== pagination.name
    ) {
      if (pagination.name) {
        const data = await this.handleSearch(pagination.name);
        this.updatePagination({ total: data.length });
        this.pageLimit(data);
      } else {
        this.updatePagination({ total: goodsData.length });
        this.pageLimit(goodsData);
      }
    }

    if (prevState.activeFilter !== this.state.activeFilter) {
      if (this.state.activeFilter !== "all") {
        this.setState(
          {
            goodsData: [],
            slicedData: [],
            pagination: { ...pagination, page: 1 },
          },
          this.getNoteTable
        );
      }
    }
  };

  updatePagination = (newPagination) => {
    this.setState((prevState) => ({
      pagination: { ...prevState.pagination, ...newPagination },
    }));
  };

  handleSearch = (value) => {
    let debounceTimer;
    this.setState({ showSpinner: true });

    return new Promise((resolve, reject) => {
      if (debounceTimer) clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        try {
          const filteredItems = this.state.goodsData.filter(
            (item) =>
              item.docNo.toLowerCase().includes(value.toLowerCase()) ||
              moment(item.docDate).format("DD/MM/YYYY").includes(value) ||
              item.docRef1?.toLowerCase().includes(value.toLowerCase()) ||
              item.supplyNo
                ?.toString()
                .toLowerCase()
                .includes(value.toLowerCase()) ||
              item.docAmt
                ?.toString()
                .toLowerCase()
                .includes(value.toLowerCase())
          );
          this.updatePagination({ total: filteredItems.length });
          resolve(filteredItems);
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  };

  setSlicedData = (data) => {
    this.setState({ slicedData: data });
  };

  printNote = (item) => {
    window.print(item);
  };

  pageLimit = (filtered) => {
    const { pagination } = this.state;
    const startIndex = (pagination.page - 1) * pagination.limit;
    const sliced = filtered.slice(startIndex, startIndex + pagination.limit);
    this.setSlicedData(sliced);
    this.setState({ showSpinner: false });
  };

  getNoteTable = () => {
    Apiservice()
      .getAPI(`StkMovdocHdrs${queryParamsGenerate(this.state.filter)}`)
      .then((res) => {
        this.setState({
          goodsData: res,
          pagination: { ...this.state.pagination, total: res.length },
          showSpinner: false,
        });
        this.pageLimit(res);
      })
      .catch((err) => console.error(err));
  };

  handleFilter = (status) => {
    const value = status === "Open" ? 0 : status === "Posted" ? 7 : null;

    this.setState((prevState) => ({
      activeFilter: status,
      propDocdata: { docNo: null, docStatus: null },
      pagination: { ...prevState.pagination, name: "", page: 1 },
      showSpinner: true,
      filter: { ...prevState.filter, docStatus: value },
    }));
  };

  handleDetails = (item) => {
    this.setState({
      activeFilter: "New",
      propDocdata: {
        docNo: item?.docNo ?? null,
        docStatus: item?.docStatus ?? null,
      },
    });
  };

  routeto = (message) => {
    this.setState({
      activeFilter: "Open",
      filter: { ...this.state.filter, docStatus: 0 },
      propDocdata: { docNo: null, docStatus: null },
    });
    if (message) this.showSuccessToast(message);
  };

  handleSort = (sortKey) => {
    const { slicedData, orderBy } = this.state;
    const sortedData = [...slicedData].sort((a, b) =>
      orderBy === "asc"
        ? a[sortKey] > b[sortKey]
          ? 1
          : -1
        : a[sortKey] < b[sortKey]
        ? 1
        : -1
    );
    this.setState({
      slicedData: sortedData,
      orderBy: orderBy === "asc" ? "desc" : "asc",
    });
  };

  dateConvert = (value) => {
    const date = new Date(value);
    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}/${date.getFullYear()}`;
  };

  render() {
    const {
      activeFilter,
      showSpinner,
      goodsData,
      pagination,
      slicedData,
      orderBy,
    } = this.state;
    const filters = ["Open", "Posted", "All", "New"];
    const headerDetails = [
      {
        label: "Doc Number",
        sortKey: "docNo",
        enabled: true,
        singleClickFunc: () => this.handleSort("docNo"),
      },
      {
        label: "Invoice Date",
        sortKey: "docDate",
        singleClickFunc: () => this.handleSort("docDate"),
      },
      {
        label: "Ref Num",
        sortKey: "docRef1",
        singleClickFunc: () => this.handleSort("docRef1"),
      },
      {
        label: "Supplier",
        sortKey: "supplyNo",
        singleClickFunc: () => this.handleSort("supplyNo"),
      },
      {
        label: "Total Amount",
        sortKey: "docAmt",
        singleClickFunc: () => this.handleSort("docAmt"),
      },
      {
        label: "Status",
        sortKey: "docStatus",
        singleClickFunc: () => this.handleSort("docStatus"),
      },
      {
        label: "Print",
        sortKey: "print",
        singleClickFunc: () => this.printNote,
      },
    ];

    return (
      <div className="notes-wrapper">
        <ToastComponent />
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
          </div>
        </div>

        {activeFilter === "New" ? (
          <AddInventory
            routeto={this.routeto}
            docData={
              this.state.propDocdata?.docNo ? this.state.propDocdata : null
            }
          />
        ) : (
          <div>
            <Table
              headerDetails={headerDetails}
              pagination={pagination}
              updatePagination={this.updatePagination}
              tableData={goodsData}
              orderBy={orderBy}
            >
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
              ) : slicedData.length > 0 ? (
                slicedData.map((item, i) => (
                  <tr key={i}>
                    <td
                      onClick={() => this.handleDetails(item)}
                      className="cursor-pointer"
                    >
                      {item.docNo}
                    </td>
                    <td>{this.dateConvert(item.docDate)}</td>
                    <td>{item.docRef1 || "-"}</td>
                    <td>{item.supplyNo}</td>
                    <td>{item.docAmt}</td>
                    <td>{item.docStatus}</td>
                    <td>
                      <img
                        onClick={() => this.printNote(item)}
                        className="icon-print"
                        src={printer}
                        alt="Print"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="no-data-row">
                  <td className="no-data-cell" colSpan={7}>
                    No Data
                  </td>
                </tr>
              )}
            </Table>
          </div>
        )}

        {this.state.showSuccessToast && (
          <div
            className="toast show align-items-center text-bg-success border-0"
            role="alert"
          >
            <div className="d-flex">
              <div className="toast-body">{this.state.message}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Close"
              ></button>
            </div>
          </div>
        )}
      </div>
    );
  }
}
